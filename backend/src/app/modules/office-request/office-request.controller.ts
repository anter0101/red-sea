import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { AuthGuard, AuthUser, Roles, RolesGuard } from 'src/core/security';
import { UserRole } from 'src/core/enums/user-role';
import type { Request } from 'src/core/utils/request';
import { PageRequest, pageRequestSortString } from 'src/core/utils/pagination.entity';
import { HeaderUtil } from 'src/core/utils/header-util';
import { DataSource, EntityManager, FindOptionsWhere } from 'typeorm';
import { withTransaction } from 'src/core/utils/transaction';

import { OfficeRequestService } from './office-request.service';
import { OfficeRequestDTO } from './dtos/office-request.dto';
import {
  CreateAskForCustodyOfficeRequestDTO,
  CreateEndWorkingShiftOfficeRequestDTO,
  CreatePrintDelegationOfficeRequestDTO,
} from './dtos/create-office-request.dto';
import type { CreateOfficeRequestDTO } from './dtos/create-office-request.dto';
import { CreateOfficeRequestValidationPipe } from './create-office-request-validation.pipe';
import { OfficeRequestQueryDTO } from './dtos/query-office-request.dto';
import { CustodyTransferParty, OfficeRequestActionDTO } from './dtos/office-request-action.dto';
import {
  mapCreateOfficeRequestDtoToEntity,
  mapOfficeRequestToDtoSelective,
} from './office-request.mapper';
import { OfficeRequestStatus, OfficeRequestType } from 'src/core/enums/office-request';
import { OfficeRequest } from './office-request.entity';
import { JourneyService } from '../journey/journey.service';
import { EmployeeService } from '../employee/employee.service';
import { AccountService } from '../account/account.service';
import {
  ACCOUNT_PARENT_CUSTODY,
  buildPersonAccountName,
} from '../account/person-account.constants';
import { CustodyService } from '../custody/custody.service';
import { Employee } from '../employee/employee.entity';
import { Account } from '../account/account.entity';
import { CustodyStatus } from 'src/core/enums/custody-status';
import { JourneyStatus } from 'src/core/enums/journey';
import { UpdateUserDTO } from '../user/dtos/update-user.dto';
import { Custody } from '../custody/custody.entity';
import { JourneyDelegationPrintService } from '../journey-delegation-print/journey-delegation-print.service';

@Controller('api/office-requests')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('office-requests-module')
export class OfficeRequestController {
  private readonly logger = new Logger('OfficeRequestController');

  constructor(
    private readonly officeRequestService: OfficeRequestService,
    private readonly journeyService: JourneyService,
    private readonly employeeService: EmployeeService,
    private readonly accountService: AccountService,
    private readonly custodyService: CustodyService,
    private readonly dataSource: DataSource,
    private readonly journeyDelegationPrintService: JourneyDelegationPrintService,
  ) {}

  @Get('/')
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.DATA_ENTRY)
  @ApiOperation({ summary: 'Get list of office requests (paginated)' })
  @ApiResponse({
    status: 200,
    description: 'List of office requests',
    type: OfficeRequestDTO,
    isArray: true,
  })
  async getAll(
    @Req() req: Request,
    @Query() query: OfficeRequestQueryDTO,
  ): Promise<Partial<OfficeRequestDTO>[]> {
    const pageRequest = new PageRequest(
      +(query.page ?? 1),
      +(query.pageSize ?? 10),
      pageRequestSortString(query.sortField, query.sortOrder),
    );

    const requestingUserId = req.user?.role === UserRole.DATA_ENTRY ? req.user.id : undefined;

    const whereConditions: FindOptionsWhere<OfficeRequest> = {};
    if (query.journeyId) {
      whereConditions.journey = { id: query.journeyId };
    }
    if (!requestingUserId && query.requestedFromId) {
      whereConditions.requestedFrom = { id: query.requestedFromId };
    }
    if (query.requestedToId) {
      whereConditions.requestedTo = { id: query.requestedToId };
    }

    const [results, count] = await this.officeRequestService.findAndCount(
      {
        skip: +pageRequest.page * pageRequest.size,
        take: +pageRequest.size,
        order: pageRequest.sort.asOrder(),
        where: whereConditions,
      },
      query,
      requestingUserId,
    );

    const dtos = mapOfficeRequestToDtoSelective(results);

    HeaderUtil.addPaginationHeaders(
      req.res!,
      count,
      pageRequest.page,
      count > pageRequest.page * pageRequest.size,
    );

    return dtos;
  }

  @Post('/:id/request-action')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin: approve or reject a pending office request' })
  @ApiResponse({
    status: 200,
    description: 'Office request action applied',
    type: OfficeRequestDTO,
  })
  async requestAction(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: OfficeRequestActionDTO,
    @AuthUser() user: UpdateUserDTO,
  ): Promise<Partial<OfficeRequestDTO>> {
    const existing = await this.officeRequestService.findByFields({
      where: { id },
      relations: [
        'journey',
        'requestedFrom',
        'requestedFrom.user',
        'requestedTo',
        'requestedTo.user',
      ],
    });
    if (!existing) throw new NotFoundException(`Office request with id ${id} not found`);

    if (existing.status !== OfficeRequestStatus.PENDING) {
      throw new BadRequestException(
        `Only pending requests can be acted on (current status: ${existing.status})`,
      );
    }

    if (dto.status === OfficeRequestStatus.APPROVED) {
      this.validateApproveCustody(existing, dto);
      await this.validateJourneyStatusForApprove(existing);
    }

    const updated = await withTransaction(this.dataSource, async (manager) => {
      if (dto.status === OfficeRequestStatus.APPROVED) {
        await this.applyApproveSideEffects(existing, dto, manager, user?.email);
      }

      existing.status = dto.status;
      existing.updatedBy = user?.email;
      existing.updatedAt = new Date();
      return manager.getRepository(OfficeRequest).save(existing);
    });

    return mapOfficeRequestToDtoSelective(updated);
  }

  @Get('/:id')
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.DATA_ENTRY)
  @ApiOperation({ summary: 'Get office request by id' })
  @ApiResponse({ status: 200, description: 'Office request found', type: OfficeRequestDTO })
  async getById(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ): Promise<Partial<OfficeRequestDTO>> {
    const existing = await this.officeRequestService.findByFields({
      where: { id },
      relations: [
        'journey',
        'requestedFrom',
        'requestedFrom.user',
        'requestedTo',
        'requestedTo.user',
      ],
    });
    if (!existing) throw new NotFoundException(`Office request with id ${id} not found`);

    if (
      req.user?.role === UserRole.DATA_ENTRY &&
      existing.requestedFrom?.user?.id !== req.user.id
    ) {
      throw new NotFoundException(`Office request with id ${id} not found`);
    }

    return mapOfficeRequestToDtoSelective(existing);
  }

  @Post('/')
  @Roles(UserRole.DATA_ENTRY)
  @ApiExtraModels(
    CreatePrintDelegationOfficeRequestDTO,
    CreateAskForCustodyOfficeRequestDTO,
    CreateEndWorkingShiftOfficeRequestDTO,
  )
  @ApiBody({
    schema: {
      oneOf: [
        { $ref: getSchemaPath(CreatePrintDelegationOfficeRequestDTO) },
        { $ref: getSchemaPath(CreateAskForCustodyOfficeRequestDTO) },
        { $ref: getSchemaPath(CreateEndWorkingShiftOfficeRequestDTO) },
      ],
    },
  })
  @ApiOperation({ summary: 'Employee: create a new office request' })
  @ApiResponse({ status: 201, description: 'Office request created', type: OfficeRequestDTO })
  async create(
    @Body(CreateOfficeRequestValidationPipe) dto: CreateOfficeRequestDTO,
    @AuthUser() user: UpdateUserDTO,
  ): Promise<Partial<OfficeRequestDTO>> {
    const parties = await this.resolveRequestParties(user);

    await this.validateReferences(dto, parties.requestedFromId, parties.requestedToId);

    const entity = mapCreateOfficeRequestDtoToEntity(dto, parties);
    const saved = await this.officeRequestService.save(entity, user?.email);

    const loaded = await this.officeRequestService.findByFields({
      where: { id: saved.id },
      relations: [
        'journey',
        'requestedFrom',
        'requestedFrom.user',
        'requestedTo',
        'requestedTo.user',
      ],
    });

    return mapOfficeRequestToDtoSelective(loaded ?? saved);
  }

  @Delete('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete office request' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const existing = await this.officeRequestService.findById(id);
    if (!existing) throw new NotFoundException(`Office request with id ${id} not found`);

    await this.officeRequestService.delete(id);
  }

  private async validateJourneyStatusForApprove(existing: OfficeRequest): Promise<void> {
    if (!existing.journey?.id) {
      return;
    }

    const journey = await this.journeyService.findById(existing.journey.id);
    if (!journey) {
      return;
    }

    if (existing.type === OfficeRequestType.END_WORKING_SHIFT) {
      const allowed = [JourneyStatus.POLICY_COLLECTED, JourneyStatus.INVOICE_ISSUED];
      if (!allowed.includes(journey.tripStatus)) {
        throw new BadRequestException(
          'Cannot approve end-of-shift custody transfer before policy is collected',
        );
      }
    }

    if (
      existing.type === OfficeRequestType.ASK_FOR_CUSTODY &&
      journey.tripStatus === JourneyStatus.INVOICE_ISSUED
    ) {
      throw new BadRequestException('Cannot approve custody request after invoice is issued');
    }
  }

  private validateApproveCustody(existing: OfficeRequest, dto: OfficeRequestActionDTO): void {
    const type = existing.type;

    if (type === OfficeRequestType.PRINT_DELEGATION) {
      return;
    }

    const custody = dto.custody;
    if (!custody?.amount || custody.amount <= 0) {
      throw new BadRequestException(`custody.amount is required when approving ${type}`);
    }

    if (type === OfficeRequestType.END_WORKING_SHIFT) {
      const transferTo = custody.transferTo ?? CustodyTransferParty.TREASURY;
      if (transferTo === CustodyTransferParty.EMPLOYEE && !custody.targetEmployeeId) {
        throw new BadRequestException(
          'custody.targetEmployeeId is required when transferTo is EMPLOYEE',
        );
      }
      return;
    }

    if (type === OfficeRequestType.ASK_FOR_CUSTODY) {
      const transferFrom = custody.transferFrom ?? CustodyTransferParty.TREASURY;
      if (transferFrom === CustodyTransferParty.EMPLOYEE && !custody.sourceEmployeeId) {
        throw new BadRequestException(
          'custody.sourceEmployeeId is required when transferFrom is EMPLOYEE',
        );
      }
    }
  }

  private async applyApproveSideEffects(
    existing: OfficeRequest,
    dto: OfficeRequestActionDTO,
    manager: EntityManager,
    updater?: string,
  ): Promise<void> {
    const custody = dto.custody;
    const requester = existing.requestedFrom;

    if (!requester?.user) {
      throw new BadRequestException('Requesting employee has no associated user');
    }

    switch (existing.type) {
      case OfficeRequestType.PRINT_DELEGATION:
        if (existing.journey?.id) {
          await this.journeyDelegationPrintService.grantPrint(
            existing.journey.id,
            manager,
            updater,
          );
        }
        return;

      case OfficeRequestType.END_WORKING_SHIFT: {
        const amount = custody!.amount;
        const fromAccount = await this.resolveEmployeeAccount(requester, manager);
        const transferTo = custody!.transferTo ?? CustodyTransferParty.TREASURY;
        const toAccount =
          transferTo === CustodyTransferParty.TREASURY
            ? await this.resolveTreasuryAccount(manager)
            : await this.resolveEmployeeAccountById(custody!.targetEmployeeId!, manager);

        await this.accountService.custodyMovement(fromAccount, toAccount, amount, manager);
        await this.closeActiveCustody(existing, manager, updater);
        return;
      }

      case OfficeRequestType.ASK_FOR_CUSTODY: {
        const amount = custody!.amount;
        const transferFrom = custody!.transferFrom ?? CustodyTransferParty.TREASURY;

        if (transferFrom === CustodyTransferParty.TREASURY) {
          const treasury = await this.resolveTreasuryAccount(manager);
          try {
            const toAccount = await this.resolveEmployeeAccount(requester, manager);
            await this.accountService.custodyMovement(treasury, toAccount, amount, manager);
          } catch (error) {
            if (error instanceof NotFoundException) {
              await this.accountService.createEmployeeCustodyAccount(requester, amount);
            } else {
              throw error;
            }
          }
        } else {
          const sourceEmployee = await this.employeeService.findByFields({
            where: { id: custody!.sourceEmployeeId },
            relations: ['user'],
          });
          if (!sourceEmployee?.user) {
            throw new NotFoundException(
              `Employee with id ${custody!.sourceEmployeeId} not found or has no user`,
            );
          }
          const fromAccount = await this.resolveEmployeeAccount(sourceEmployee, manager);
          const toAccount = await this.resolveEmployeeAccount(requester, manager);
          await this.accountService.custodyMovement(fromAccount, toAccount, amount, manager);
        }
        return;
      }

      default:
        return;
    }
  }

  private async closeActiveCustody(
    existing: OfficeRequest,
    manager: EntityManager,
    updater?: string,
  ): Promise<void> {
    if (!existing.requestedFrom?.id) {
      return;
    }

    if (existing.journey?.id) {
      const custody = await manager.findOne(Custody, {
        where: {
          journey: { id: existing.journey.id },
          employee: { id: existing.requestedFrom.id },
          status: CustodyStatus.ACTIVE,
        },
      });

      if (custody) {
        custody.status = CustodyStatus.CLOSED;
        custody.updatedBy = updater;
        custody.updatedAt = new Date();
        await manager.save(custody);
      }
      return;
    }

    const activeCustodies = await manager.find(Custody, {
      where: {
        employee: { id: existing.requestedFrom.id },
        status: CustodyStatus.ACTIVE,
      },
    });

    for (const custody of activeCustodies) {
      custody.status = CustodyStatus.CLOSED;
      custody.updatedBy = updater;
      custody.updatedAt = new Date();
      await manager.save(custody);
    }
  }

  private async resolveRequestParties(
    user: UpdateUserDTO,
  ): Promise<{ requestedFromId: number; requestedToId: number }> {
    const emp = await this.employeeService.findByFields({
      where: { user: { id: user.id } },
    });
    if (!emp) {
      throw new NotFoundException(`Employee with user id ${user.id} not found`);
    }

    const adminEmp =
      (await this.employeeService.findByFields({
        where: { user: { role: UserRole.ADMIN } },
        relations: ['user'],
      })) ??
      (await this.employeeService.findByFields({
        where: { user: { role: UserRole.DATA_ENTRY } },
        relations: ['user'],
      }));

    if (!adminEmp) {
      throw new BadRequestException(
        'No admin employee configured for office requests. Create an employee linked to an ADMIN user.',
      );
    }

    return { requestedFromId: emp.id, requestedToId: adminEmp.id };
  }

  private async resolveEmployeeAccount(
    employee: Employee,
    manager?: EntityManager,
  ): Promise<Account> {
    if (!employee.user) {
      throw new BadRequestException(`Employee ${employee.id} does not have an associated user`);
    }

    const accountName = buildPersonAccountName(
      employee.user.firstName,
      employee.user.lastName,
      `Employee ${employee.id}`,
    );

    return this.accountService.findPersonSubAccount(accountName, ACCOUNT_PARENT_CUSTODY, manager);
  }

  private async resolveEmployeeAccountById(
    employeeId: number,
    manager?: EntityManager,
  ): Promise<Account> {
    const employee = await this.employeeService.findByFields({
      where: { id: employeeId },
      relations: ['user'],
    });
    if (!employee) {
      throw new NotFoundException(`Employee with id ${employeeId} not found`);
    }
    return this.resolveEmployeeAccount(employee, manager);
  }

  private async resolveTreasuryAccount(manager?: EntityManager): Promise<Account> {
    const account = manager
      ? await manager.findOne(Account, { where: { name: 'الخزينه' } })
      : await this.accountService.findByFields({ where: { name: 'الخزينه' } });

    if (!account) {
      throw new NotFoundException('Treasury account (الخزينه) not found');
    }

    return account;
  }

  private async validateReferences(
    dto: CreateOfficeRequestDTO,
    requestedFromId: number,
    requestedToId: number,
  ): Promise<void> {
    if (dto.type === OfficeRequestType.PRINT_DELEGATION) {
      const journey = await this.journeyService.findById(dto.journeyId);
      if (!journey) {
        throw new NotFoundException(`Journey with id ${dto.journeyId} not found`);
      }
      await this.journeyDelegationPrintService.assertPrintRequestAllowed(dto.journeyId);
    } else if (dto.journeyId) {
      const journey = await this.journeyService.findById(dto.journeyId);
      if (!journey) {
        throw new NotFoundException(`Journey with id ${dto.journeyId} not found`);
      }
    }

    const requestedFrom = await this.employeeService.findById(requestedFromId);
    if (!requestedFrom) {
      throw new NotFoundException(`Employee with id ${requestedFromId} not found`);
    }

    const requestedTo = await this.employeeService.findById(requestedToId);
    if (!requestedTo) {
      throw new NotFoundException(`Employee with id ${requestedToId} not found`);
    }
  }
}
