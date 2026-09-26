import { ClientService } from '../factory/client.service';
import { JourneyTransactionService } from '../journey-transaction/journey-transaction.service';
import { JourneyTransaction } from '../journey-transaction/journey-transaction.entity';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Logger,
  BadRequestException,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  forwardRef,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard, AuthUser, Roles, RolesGuard } from 'src/core/security';
import { UserRole } from 'src/core/enums/user-role';
import type { Request } from 'src/core/utils/request';
import { PageRequest, pageRequestSortString } from 'src/core/utils/pagination.entity';

import { JourneyService } from './journey.service';
import { JourneyAssetsService } from './journey-assets.service';
import { JourneyDTO } from './dtos/journey.dto';
import { CreateJourneyDTO } from './dtos/create-journey.dto';
import { UpdateJourneyDTO } from './dtos/update-journey.dto';
import { JourneyQueryDTO } from './dtos/query-journey.dto';
import { JourneyStatus } from 'src/core/enums/journey';
import { JourneyStatsDTO } from './dtos/journey-stats.dto';
import { JourneyStatusEventDTO } from './dtos/journey-status-event.dto';
import { JourneyListScope } from './journey-list-scope.types';
import {
  mapCreateJourneyDtoToEntity,
  mapJourneyToDtoSelective,
  mapUpdateJourneyDtoToEntity,
} from './journey.mapper';
import { DriverService } from '../driver/driver.service';
import { CarService } from '../car/car.service';
import { TrailerService } from '../trailer/trailer.service';
import { HeaderUtil } from 'src/core/utils/header-util';
import { UserService } from '../user/user.service';
import { JourneyTransactionType, JourneyTransactionCategoryType } from 'src/core/enums/journey';
import { EmployeeService } from '../employee/employee.service';
import { withTransaction } from 'src/core/utils/transaction';
import { DataSource } from 'typeorm';
import { AccountService } from '../account/account.service';
import { CustodyService } from '../custody/custody.service';
import { CustodyStatus } from 'src/core/enums/custody-status';
import { Custody } from '../custody/custody.entity';
import { Driver } from '../driver/driver.entity';
import { Employee } from '../employee/employee.entity';
import { ACCOUNT_PARENT_CUSTODY, buildPersonAccountName } from '../account/person-account.constants';
import { JourneyDelegationPrintService } from '../journey-delegation-print/journey-delegation-print.service';
import { EmployeeCustodyBalanceDTO } from './dtos/employee-custody-balance.dto';
import { JourneyRevenueService } from './journey-revenue.service';

@Controller('api/journeys')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('journeys-module')
export class JourneyController {
  logger = new Logger('JourneyController');

  constructor(
    private readonly journeyService: JourneyService,
    private readonly journeyAssetsService: JourneyAssetsService,
    private readonly driverService: DriverService,
    private readonly UserService: UserService,
    private readonly carService: CarService,
    private readonly trailerService: TrailerService,
    private readonly journeyTransactionService: JourneyTransactionService,
    private readonly clientService: ClientService,
    @Inject(forwardRef(() => EmployeeService))
    private readonly employeeService: EmployeeService,
    private readonly accountService: AccountService,
    @Inject(forwardRef(() => CustodyService))
    private readonly custodyService: CustodyService,
    private readonly dataSource: DataSource,
    private readonly journeyDelegationPrintService: JourneyDelegationPrintService,
    private readonly journeyRevenueService: JourneyRevenueService,
  ) { }

  private resolveListScope(req: Request): JourneyListScope | undefined {
    return req.user?.role === UserRole.DATA_ENTRY && req.user?.id
      ? { custodySourceUserId: req.user.id }
      : undefined;
  }

  @Get('/')
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.DATA_ENTRY)
  @ApiOperation({ summary: 'Get list of journeys paginated' })
  @ApiResponse({ status: 200, description: 'List of journeys', type: JourneyDTO, isArray: true })
  async getAll(@Req() req: Request, @Query() query: JourneyQueryDTO): Promise<any> {
    const pageRequest = new PageRequest(
      +(query.page ?? 1), // zero-based for skip
      +(query.pageSize ?? 10),
      pageRequestSortString(query.sortField, query.sortOrder),
    );

    const scope = this.resolveListScope(req);

    // Fetch journeys with QueryBuilder
    const [results, count] = await this.journeyService.findAndCount(
      query,
      pageRequest.page,
      pageRequest.size,
      query.sortField,
      (query.sortOrder as 'ASC' | 'DESC') || 'ASC',
      scope,
    );

    // Add pagination headers to the response
    HeaderUtil.addPaginationHeaders(
      req.res!,
      count,
      pageRequest.page,
      count > pageRequest.page * pageRequest.size,
    );

    return results;
  }

  @Get('/stats')
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.DATA_ENTRY)
  @ApiOperation({ summary: 'Get journey KPI stats using the same filters as the list' })
  @ApiResponse({ status: 200, description: 'Journey stats', type: JourneyStatsDTO })
  async getStats(@Req() req: Request, @Query() query: JourneyQueryDTO): Promise<JourneyStatsDTO> {
    return this.journeyService.getStats(query, this.resolveListScope(req));
  }

  @Get('/office/custody-amount')
  @Roles(UserRole.DATA_ENTRY, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get office employee custody balance for journey create',
    description:
      'Returns custody balance for the employee linked to the authenticated user (from JWT).',
  })
  @ApiResponse({ status: 200, description: 'Custody balance', type: EmployeeCustodyBalanceDTO })
  async getOfficeCustodyAmount(
    @AuthUser() user: { id: number; role: UserRole },
  ): Promise<EmployeeCustodyBalanceDTO> {
    const employee = await this.employeeService.findByFields({
      where: { user: { id: user.id } },
      relations: ['user'],
    });

    if (!employee) {
      throw new NotFoundException(`Employee with user id ${user.id} not found`);
    }

    return this.accountService.getEmployeeCustodyBalance(employee);
  }

  @Post('/office')
  @Roles(UserRole.DATA_ENTRY)
  @ApiOperation({ summary: 'Create a new journey' })
  @ApiResponse({ status: 201, description: 'Journey created', type: JourneyDTO })
  async officeCreate(@Body() dto: CreateJourneyDTO, @AuthUser() user: any): Promise<Partial<JourneyDTO>> {
    const saved = await withTransaction(this.dataSource, async (manager) => {
      const resolvedAssets = await this.journeyAssetsService.resolveForCreate(dto, manager, user?.email);
      dto.driverId = resolvedAssets.driverId;
      dto.carId = resolvedAssets.carId;
      dto.trailerId = resolvedAssets.trailerId;
      await this.validateJourneyReferences(dto);

      const emp = await manager.findOne(Employee, {
        where: { user: { id: user.id } },
        relations: ['user'],
      });

      if (!emp) {
        throw new NotFoundException(`Employee with user id ${user.id} not found`);
      }

      const driver = await manager.findOne(Driver, {
        where: { id: dto.driverId },
        relations: ['user'],
      });

      if (!driver) {
        throw new NotFoundException(`Driver with id ${dto.driverId} not found`);
      }

      const entity = mapCreateJourneyDtoToEntity(dto);
      entity.custodySource = emp;
      const savedJourney = await this.journeyService.save(entity, user?.email, manager);

      if (dto.custodyAmount && dto.custodyAmount > 0) {
        const txEntity = new JourneyTransaction();
        txEntity.journey = savedJourney;
        txEntity.transactionType = JourneyTransactionType.ADVANCE;
        txEntity.category = JourneyTransactionCategoryType.CUSTODY;
        txEntity.amount = dto.custodyAmount;
        await this.journeyTransactionService.save(txEntity, user?.email, manager);

        const empAccount = await this.accountService.findPersonSubAccount(
          buildPersonAccountName(emp.user.firstName, emp.user.lastName, `Employee ${emp.id}`),
          ACCOUNT_PARENT_CUSTODY,
          manager,
        );

        const driverAccount = await this.accountService.findPersonSubAccount(
          buildPersonAccountName(
            driver.user.firstName,
            driver.user.lastName,
            `Driver ${driver.id}`,
          ),
          ACCOUNT_PARENT_CUSTODY,
          manager,
        );

        await this.accountService.custodyMovement(
          empAccount,
          driverAccount,
          dto.custodyAmount,
          manager,
        );

        const custody = new Custody();
        custody.employee = emp;
        custody.account = driverAccount;
        custody.journey = savedJourney;
        custody.driver = driver;
        custody.status = CustodyStatus.ACTIVE;
        await this.custodyService.save(custody, user?.email, manager);
      }

      await this.journeyDelegationPrintService.createForJourney(
        savedJourney.id,
        manager,
        user?.email,
      );

      if (dto.deliveryAreaId) {
        await this.journeyRevenueService.applyExpected(
          savedJourney.id,
          dto.deliveryAreaId,
          new Date(),
          user?.email,
          manager,
        );
      }

      return savedJourney;
    });

    return mapJourneyToDtoSelective(saved);
  }

  // @Post('/')
  // @Roles(UserRole.ADMIN)
  // @ApiOperation({ summary: 'Create a new journey' })
  // @ApiResponse({ status: 201, description: 'Journey created', type: JourneyDTO })
  // async create(@Body() dto: CreateJourneyDTO, @AuthUser() user: any): Promise<Partial<JourneyDTO>> {
  //   // Validate all foreign key references
  //   await this.validateJourneyReferences(dto);

  //   // Create journey and related transaction within a database transaction
  //   const saved = await withTransaction(this.dataSource, async () => {
  //     const entity = mapCreateJourneyDtoToEntity(dto);
  //     const savedJourney = await this.journeyService.save(entity, user?.email);

  //     // Create advance transaction for custody amount if provided
  //     if (dto.custodyAmount && dto.custodyAmount > 0) {
  //       const txEntity = new JourneyTransaction();
  //       txEntity.journey = savedJourney;
  //       txEntity.transactionType = JourneyTransactionType.ADVANCE;
  //       txEntity.category = JourneyTransactionCategoryType.CUSTODY;
  //       txEntity.amount = dto.custodyAmount;
  //       await this.journeyTransactionService.save(txEntity, user?.email);
  //     }

  //     return savedJourney;
  //   });

  //   return mapJourneyToDtoSelective(saved);
  // }


  private async validateJourneyReferences(dto: CreateJourneyDTO | UpdateJourneyDTO): Promise<void> {
    if (dto.driverAssistantId !== undefined) {
      const assistant = await this.UserService.findByFields({
        where: { id: dto.driverAssistantId, role: UserRole.DRIVER_ASSISTANT },
      });
      if (!assistant) {
        throw new NotFoundException(`Assistant driver with id ${dto.driverAssistantId} not found`);
      }
    }

    if (dto.clientId !== undefined) {
      const client = await this.clientService.findById(dto.clientId);
      if (!client) {
        throw new NotFoundException(`Client with id ${dto.clientId} not found`);
      }
    }


  }

  // UPDATE
  @Put('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update journey' })
  @ApiResponse({ status: 200, description: 'Journey updated', type: JourneyDTO })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateJourneyDTO,
    @AuthUser() user: any,
  ): Promise<Partial<JourneyDTO>> {
    const existing = await this.journeyService.findById(id);
    if (!existing) throw new NotFoundException(`Journey with id ${id} not found`);

    const updated = await withTransaction(this.dataSource, async (manager) => {
      await this.journeyAssetsService.resolveForUpdate(dto, manager, user?.email);
      await this.validateJourneyReferences(dto);

      const updatedEntity = mapUpdateJourneyDtoToEntity(dto, existing);
      const savedJourney = await this.journeyService.update(updatedEntity, user?.email);

      const shouldRefreshExpected =
        dto.deliveryAreaId !== undefined ||
        dto.quantity !== undefined ||
        dto.packingType !== undefined ||
        dto.clientId !== undefined;
      if (shouldRefreshExpected) {
        await this.journeyRevenueService.applyExpectedForJourney(
          savedJourney.id,
          dto.deliveryAreaId,
          user?.email,
          manager,
        );
      }

      // Handle custody advance transaction on update
      if (dto.custodyAmount !== undefined) {
        const existingCustodyTx = await this.journeyTransactionService.findByFields({
          where: {
            journey: { id: savedJourney.id },
            transactionType: JourneyTransactionType.ADVANCE,
            category: JourneyTransactionCategoryType.CUSTODY,
          },
        });

        if (dto.custodyAmount > 0) {
          if (existingCustodyTx) {
            existingCustodyTx.amount = dto.custodyAmount;
            await this.journeyTransactionService.update(existingCustodyTx, user?.email);
          } else {
            const txEntity = new JourneyTransaction();
            txEntity.journey = savedJourney;
            txEntity.transactionType = JourneyTransactionType.ADVANCE;
            txEntity.category = JourneyTransactionCategoryType.CUSTODY;
            txEntity.amount = dto.custodyAmount;
            await this.journeyTransactionService.save(txEntity, user?.email);
          }
        } else if (existingCustodyTx) {
          await this.journeyTransactionService.delete(existingCustodyTx.id);
        }
      }

      return savedJourney;
    });

    return mapJourneyToDtoSelective(updated);
  }

  // DELETE
  @Delete('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete journey' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const existing = await this.journeyService.findById(id);
    if (!existing) throw new NotFoundException(`Journey with id ${id} not found`);
    await this.journeyService.delete(existing.id);
  }

  // VIEW (aggregated)

  @Get('/:id/employees')
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.DATA_ENTRY)
  @ApiOperation({ summary: 'Get journey employees by id' })
  @ApiResponse({ status: 200, description: 'The found journey employees', type: JourneyDTO })
  async getJourneyEmployees(@Param('id', ParseIntPipe) id: number): Promise<Partial<JourneyDTO>> {
    const journey = await this.journeyService.findByFields({
      where: { id },
      relations: ['custodySource'],
    });
    if (!journey) throw new NotFoundException(`Journey with id ${id} not found`);

    const employees = await this.journeyService.getJourneyEmployees(id);
    return employees;
  }

  @Get('/:id/vehicles')
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.DATA_ENTRY)
  @ApiOperation({ summary: 'Get journey vehicles by id' })
  @ApiResponse({ status: 200, description: 'The found journey vehicles', type: JourneyDTO })
  async getJourneyVehicles(@Param('id', ParseIntPipe) id: number): Promise<Partial<JourneyDTO>> {
    const vehicles = await this.journeyService.getJourneyVehicles(id);
    return vehicles;
  }

  @Get('/:id/history')
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.DATA_ENTRY)
  @ApiOperation({ summary: 'Get journey status change history' })
  @ApiResponse({ status: 200, description: 'Status events', type: JourneyStatusEventDTO, isArray: true })
  async getJourneyHistory(@Param('id', ParseIntPipe) id: number): Promise<JourneyStatusEventDTO[]> {
    const journey = await this.journeyService.findById(id);
    if (!journey) throw new NotFoundException(`Journey with id ${id} not found`);

    const events = await this.journeyService.getStatusHistory(id);
    return events.map(event => ({
      id: event.id,
      fromStatus: event.fromStatus ?? null,
      toStatus: event.toStatus,
      changedBy: event.changedBy,
      createdAt: event.createdAt,
    }));
  }

  @Get('/:id/info')
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.DATA_ENTRY)
  @ApiOperation({ summary: 'Get journey info by id' })
  @ApiResponse({ status: 200, description: 'The found journey info', type: JourneyDTO })
  async getJourneyInfo(@Param('id', ParseIntPipe) id: number): Promise<Partial<JourneyDTO>> {
    const info = await this.journeyService.getJourneyInfo(id);
    return info;
  }

  @Get('/:id')
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.DATA_ENTRY)
  @ApiOperation({
    summary: 'Get comprehensive journey details by id',
    description:
      'Returns all journey information including delegate number, vehicle details, driver info, custody source, and policy details',
  })
  @ApiResponse({ status: 200, description: 'Comprehensive journey details' })
  async getJourneyDetails(@Param('id', ParseIntPipe) id: number): Promise<any> {
    const journey = await this.journeyService.findById(id);
    if (!journey) throw new NotFoundException(`Journey with id ${id} not found`);

    const details = await this.journeyService.getJourneyDetailsById(id);
    return details;
  }
}
