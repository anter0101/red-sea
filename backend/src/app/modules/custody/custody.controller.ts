import {
  Controller,
  Logger,
  UseGuards,
  Post,
  Put,
  Delete,
  Body,
  Param,
  NotFoundException,
  BadRequestException,
  Get,
  Req,
  Query,
  ParseIntPipe,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard, Roles, RolesGuard, AuthUser } from 'src/core/security';
import { CustodyDTO } from './dtos/custody.dto';
import { UserRole } from 'src/core/enums/user-role';
import { UpdateCustodyDTO } from './dtos/update-custody.dto';
import type { Request } from 'src/core/utils/request';
import { CreateCustodyDTO } from './dtos/create-custody.dto';
import { CustodyService } from './custody.service';
import { UserDTO } from '../user/dtos/user.dto';
import { PageRequest, pageRequestSortString } from 'src/core/utils/pagination.entity';
import {
  mapCreateCustodyDtoToEntity,
  mapCustodyToCustodyDtoSelective,
  mapUpdateCustodyDtoToEntity,
} from './custody.mapper';
import { HeaderUtil } from 'src/core/utils/header-util';
import { CustodyQueryDTO } from './dtos/query-custody.dto';
import { EmployeeService } from '../employee/employee.service';
import { AccountService } from '../account/account.service';
import { JourneyService } from '../journey/journey.service';
import { DriverService } from '../driver/driver.service';
import { FindOptionsWhere } from 'typeorm';
import { Custody } from './custody.entity';

@Controller('api/custodies')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('custodies-module')
export class CustodyController {
  logger = new Logger('CustodyController');

  constructor(
    private readonly custodyService: CustodyService,
    private readonly employeeService: EmployeeService,
    private readonly accountService: AccountService,
    @Inject(forwardRef(() => JourneyService))
    private readonly journeyService: JourneyService,
    private readonly driverService: DriverService,
  ) {}

  @Get('/')
  @Roles(UserRole.ADMIN, UserRole.DATA_ENTRY)
  @ApiOperation({ summary: 'Get the list of custodies paginated' })
  @ApiResponse({
    status: 200,
    description: 'List all custodies',
    type: CustodyDTO,
    isArray: true,
  })
  async getAllCustodies(
    @Req() req: Request,
    @Query() query: CustodyQueryDTO,
  ): Promise<UpdateCustodyDTO[]> {
    const pageRequest: PageRequest = new PageRequest(
      +(query.page ?? 1),
      +(query.pageSize ?? 10),
      pageRequestSortString(query.sortField, query.sortOrder),
    );

    const whereConditions: FindOptionsWhere<Custody> = {};
    if (query.accountId) {
      whereConditions.account = { id: query.accountId };
    }
    if (query.status) {
      whereConditions.status = query.status;
    }
    if (query.journeyId) {
      whereConditions.journey = { id: query.journeyId };
    }
    if (query.driverId) {
      whereConditions.driver = { id: query.driverId };
    }

    const isDataEntry = req.user?.role === UserRole.DATA_ENTRY;
    const scope = isDataEntry && req.user?.id ? { employeeUserId: req.user.id } : undefined;

    if (!isDataEntry && query.employeeId) {
      whereConditions.employee = { id: query.employeeId };
    }

    const [results, count] = await this.custodyService.findAndCount(
      {
        skip: +pageRequest.page * pageRequest.size,
        take: +pageRequest.size,
        order: pageRequest.sort.asOrder(),
        relations: [
          'employee',
          'employee.user',
          'account',
          'journey',
          'journey.assistant',
          'journey.driver',
          'journey.driver.user',
          'journey.car',
          'journey.trailer',
          'journey.client',
          'driver',
          'driver.user',
        ],
        where: whereConditions,
      },
      query,
      scope,
    );

    const accountIds = results
      .map((custody) => custody.account?.id)
      .filter((id): id is number => id !== undefined);
    const balances = await this.accountService.getCurrentBalancesForAccounts(accountIds);

    const custodyDtos = mapCustodyToCustodyDtoSelective(
      results,
      [
        'id',
        'employeeId',
        'accountId',
        'journeyId',
        'driverId',
        'status',
        'createdAt',
        'updatedAt',
        'employee',
        'account',
        'journey',
        'driver',
        'custodyAmount',
      ],
      true,
    ).map((dto) => ({
      ...dto,
      custodyAmount: dto.accountId ? (balances.get(dto.accountId) ?? 0) : 0,
    }));

    HeaderUtil.addPaginationHeaders(
      req.res!,
      count,
      pageRequest.page,
      count > pageRequest.page * pageRequest.size,
    );

    return custodyDtos;
  }

  @Get('/:id')
  @Roles(UserRole.ADMIN, UserRole.DATA_ENTRY)
  @ApiOperation({ summary: 'Get custody by id' })
  @ApiResponse({ status: 200, description: 'Custody found', type: CustodyDTO })
  async getCustodyById(@Param('id', ParseIntPipe) id: number): Promise<UpdateCustodyDTO> {
    const existing = await this.custodyService.find({
      where: { id },
      relations: [
        'employee',
        'employee.user',
        'account',
        'journey',
        'journey.assistant',
        'journey.driver',
        'journey.driver.user',
        'journey.car',
        'journey.trailer',
        'journey.client',
        'driver',
        'driver.user',
      ],
    });
    if (!existing) throw new NotFoundException(`Custody with id ${id} not found`);

    const dto = mapCustodyToCustodyDtoSelective(
      existing,
      [
        'id',
        'employeeId',
        'accountId',
        'journeyId',
        'driverId',
        'status',
        'createdAt',
        'updatedAt',
        'employee',
        'account',
        'journey',
        'driver',
        'custodyAmount',
      ],
      true,
    );

    return {
      ...dto,
      custodyAmount: existing.account?.id
        ? await this.accountService.getCurrentBalance(existing.account.id)
        : 0,
    };
  }

  @Post('/')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new custody record' })
  @ApiResponse({ status: 201, description: 'Record created', type: CustodyDTO })
  async create(
    @Body() dto: CreateCustodyDTO,
    @AuthUser() user: UserDTO,
  ): Promise<Partial<CustodyDTO>> {
    const employee = await this.employeeService.findById(dto.employeeId);
    if (!employee) {
      throw new BadRequestException(`Employee with id ${dto.employeeId} does not exist`);
    }

    const account = await this.accountService.findById(dto.accountId);
    if (!account) {
      throw new BadRequestException(`Account with id ${dto.accountId} does not exist`);
    }

    if (dto.journeyId !== undefined) {
      const journey = await this.journeyService.findById(dto.journeyId);
      if (!journey) {
        throw new BadRequestException(`Journey with id ${dto.journeyId} does not exist`);
      }
    }

    if (dto.driverId !== undefined) {
      const driver = await this.driverService.findById(dto.driverId);
      if (!driver) {
        throw new BadRequestException(`Driver with id ${dto.driverId} does not exist`);
      }
    }

    const existing = await this.custodyService.findByFields({
      where: {
        employee: { id: dto.employeeId },
        account: { id: dto.accountId },
      },
    });
    if (existing) {
      throw new BadRequestException(
        `Custody already exists for employee ${dto.employeeId} and account ${dto.accountId}`,
      );
    }

    const entity = mapCreateCustodyDtoToEntity(dto);
    const savedCustody = await this.custodyService.save(entity, user?.email);

    return mapCustodyToCustodyDtoSelective(savedCustody, [
      'id',
      'employeeId',
      'accountId',
      'journeyId',
      'driverId',
      'status',
    ]);
  }

  @Put('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update existing custody record' })
  @ApiResponse({ status: 200, description: 'Record updated', type: CustodyDTO })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCustodyDTO,
    @AuthUser() user: UserDTO,
  ): Promise<UpdateCustodyDTO> {
    const existing = await this.custodyService.find({
      where: { id },
      relations: ['employee', 'account'],
    });
    if (!existing) throw new NotFoundException(`Custody with id ${id} not found`);

    dto.id = id;

    if (dto.employeeId !== undefined) {
      const employee = await this.employeeService.findById(dto.employeeId);
      if (!employee) {
        throw new BadRequestException(`Employee with id ${dto.employeeId} does not exist`);
      }
    }

    if (dto.accountId !== undefined) {
      const account = await this.accountService.findById(dto.accountId);
      if (!account) {
        throw new BadRequestException(`Account with id ${dto.accountId} does not exist`);
      }
    }

    if (dto.journeyId !== undefined) {
      const journey = await this.journeyService.findById(dto.journeyId);
      if (!journey) {
        throw new BadRequestException(`Journey with id ${dto.journeyId} does not exist`);
      }
    }

    if (dto.driverId !== undefined) {
      const driver = await this.driverService.findById(dto.driverId);
      if (!driver) {
        throw new BadRequestException(`Driver with id ${dto.driverId} does not exist`);
      }
    }

    const employeeId = dto.employeeId ?? existing.employee?.id;
    const accountId = dto.accountId ?? existing.account?.id;

    if (employeeId && accountId) {
      const duplicate = await this.custodyService.findByFields({
        where: {
          employee: { id: employeeId },
          account: { id: accountId },
        },
      });

      if (duplicate && duplicate.id !== id) {
        throw new BadRequestException(
          `Custody already exists for employee ${employeeId} and account ${accountId}`,
        );
      }
    }

    const mappedCustody = mapUpdateCustodyDtoToEntity(dto);
    const updatedCustody = await this.custodyService.update(mappedCustody, user?.email);

    return mapCustodyToCustodyDtoSelective(updatedCustody, [
      'id',
      'employeeId',
      'accountId',
      'journeyId',
      'driverId',
      'status',
    ]);
  }

  @Delete('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete custody record' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const existing = await this.custodyService.findById(id);
    if (!existing) throw new NotFoundException(`Custody with id ${id} not found`);
    await this.custodyService.delete(existing.id);
  }
}
