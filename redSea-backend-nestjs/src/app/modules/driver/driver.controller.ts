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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard, Roles, RolesGuard, AuthUser } from 'src/core/security';
import { DriverDTO } from './dtos/driver.dto';
import { UserRole } from 'src/core/enums/user-role';
import { UpdateDriverDTO } from './dtos/update-driver.dto';
import type { Request } from 'src/core/utils/request';
import { CreateDriverDTO } from './dtos/create-driver.dto';
import { DriverService } from './driver.service';
import { UserDTO } from '../user/dtos/user.dto';
import { PageRequest, pageRequestSortString } from 'src/core/utils/pagination.entity';
import {
  mapCreateDriverDtoToEntity,
  mapDriverToDriverDtoSelective,
  mapUpdateDriverDtoToEntity,
} from './driver.mapper';
import { HeaderUtil } from 'src/core/utils/header-util';
import { DriverQueryDTO } from './dtos/query-driver.dto';
import { UserService } from '../user/user.service';
import { mapCreateContactDtoToEntity } from '../contact/contact.mapper';
import { Contact } from '../contact/contact.entity';
import { ContactService } from '../contact/contact.service';
import { DataSource } from 'typeorm';
import { withTransaction } from 'src/core/utils/transaction';
import { AccountService } from '../account/account.service';
import { NestedCreateContactDTO } from '../contact/dtos/nested-create-contact.dto';
import {
  buildPersonAccountName,
  PERSON_ACCOUNT_PARENTS,
} from '../account/person-account.constants';
import { DriverStatsDTO } from './dtos/driver-stats.dto';

type DriverContactPayload = Pick<NestedCreateContactDTO, 'phone' | 'isPrimary'>;

@Controller('api/drivers')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('drivers-module')
export class DriverController {
  logger = new Logger('DriversController');

  constructor(
    private readonly driverService: DriverService,
    private readonly userService: UserService,
    private readonly contactService: ContactService,
    private readonly accountService: AccountService,
    private readonly dataSource: DataSource,
  ) {}

  @Get('/')
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.DATA_ENTRY)
  @ApiOperation({ summary: 'Get the list of drivers paginated' })
  @ApiResponse({
    status: 200,
    description: 'List all drivers',
    type: DriverDTO,
    isArray: true,
  })
  async getAllDrivers(
    @Req() req: Request,
    @Query() query: DriverQueryDTO,
  ): Promise<UpdateDriverDTO[]> {
    const pageRequest: PageRequest = new PageRequest(
      +(query.page ?? 1),
      +(query.pageSize ?? 10),
      pageRequestSortString(query.sortField, query.sortOrder),
    );

    const [results, count] = await this.driverService.findAndCount(
      {
        skip: +pageRequest.page * pageRequest.size,
        take: +pageRequest.size,
        order: pageRequest.sort.asOrder(),
        relations: ['user', 'user.contacts', 'user.salary'],
      },
      query,
    );

    const driverDtos = mapDriverToDriverDtoSelective(results, [
      'id',
      'licenseNumber',
      'licenseExpiryDate',
      'user',
      'currentJourneyId',
      'currentCarId',
      'currentCarCode',
    ]);

    HeaderUtil.addPaginationHeaders(
      req.res!,
      count,
      pageRequest.page,
      count > pageRequest.page * pageRequest.size,
    );

    return driverDtos;
  }

  @Get('/stats')
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.DATA_ENTRY)
  @ApiOperation({ summary: 'Driver list KPI counts by status' })
  @ApiResponse({ status: 200, description: 'Driver stats', type: DriverStatsDTO })
  async getDriverStats(): Promise<DriverStatsDTO> {
    return this.driverService.getStats();
  }

  @Get('/:id')
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.DATA_ENTRY)
  @ApiOperation({ summary: 'Get driver by id' })
  @ApiResponse({ status: 200, description: 'Driver found', type: DriverDTO })
  async getDriverById(@Param('id') id: number): Promise<UpdateDriverDTO> {
    const existing = await this.driverService.find({
      where: { id },
      relations: ['user', 'user.contacts', 'user.salary', 'user.userAttachments'],
    });
    if (!existing) throw new NotFoundException(`Driver with id ${id} not found`);

    const [enriched] = await this.driverService.enrichWithCurrentJourneys([existing]);

    return mapDriverToDriverDtoSelective(enriched, [
      'id',
      'licenseNumber',
      'licenseExpiryDate',
      'user',
      'currentJourneyId',
      'currentCarId',
      'currentCarCode',
    ]);
  }

  @Post('/')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new driver' })
  @ApiResponse({ status: 201, description: 'Record created', type: DriverDTO })
  async create(@Body() dto: CreateDriverDTO, @AuthUser() user: UserDTO): Promise<DriverDTO> {
    const existing = await this.driverService.findByFields({
      where: { licenseNumber: dto.licenseNumber },
    });
    if (existing)
      throw new BadRequestException(
        `Driver with license number ${dto.licenseNumber} already exists`,
      );

    if (dto.user.email) {
      const emailCheck = await this.userService.findByFields({
        where: { email: dto.user.email },
      });

      if (emailCheck) {
        throw new BadRequestException(`User with email ${dto.user.email} already exists`);
      }
    }

    const contacts = this.resolveContacts(dto);
    if (contacts && contacts.length > 0) {
      const hasDuplicates = contacts.some(
        (contact, index) => contacts.findIndex((c) => c.phone === contact.phone) !== index,
      );

      if (hasDuplicates) {
        throw new BadRequestException('Duplicate contact phone numbers found');
      }
    }

    const savedDriver = await withTransaction(this.dataSource, async (manager) => {
      const entity = await mapCreateDriverDtoToEntity(dto);
      entity.user.role = UserRole.DRIVER;
      const driver = await this.driverService.save(entity, user?.email);

      if (contacts && contacts.length > 0) {
        const mappedContacts = mapCreateContactDtoToEntity(
          contacts.map((c) => ({ ...c, userId: driver.user.id })),
        ) as Contact[];
        await this.contactService.save(mappedContacts, user?.email);
      }

      const personName = buildPersonAccountName(
        driver.user?.firstName,
        driver.user?.lastName,
        `Driver ${driver.id}`,
      );
      await this.accountService.createPersonSubAccounts(
        personName,
        PERSON_ACCOUNT_PARENTS[UserRole.DRIVER]!,
        user?.email,
        manager,
      );

      return driver;
    });

    return savedDriver;
  }

  @Put('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update existing driver' })
  @ApiResponse({ status: 200, description: 'Record updated', type: DriverDTO })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDriverDTO,
    @AuthUser() user: UserDTO,
  ): Promise<UpdateDriverDTO> {
    const existing = await this.driverService.findByFields({
      where: { id },
      relations: ['user'],
    });
    if (!existing) throw new NotFoundException(`Driver with id ${id} not found`);

    const contacts = this.resolveContacts(dto);
    if (contacts && contacts.length > 0) {
      const hasDuplicates = contacts.some(
        (contact, index) => contacts.findIndex((c) => c.phone === contact.phone) !== index,
      );

      if (hasDuplicates) {
        throw new BadRequestException('Duplicate contact phone numbers found');
      }
    }

    const updated = await withTransaction(this.dataSource, async () => {
      dto.id = id;

      if (dto.user?.username) {
        const existingUser = await this.userService.findByFields({
          where: { username: dto.user.username },
        });
        if (existingUser && existing.user.id !== existingUser.id) {
          throw new BadRequestException(`User with username ${dto.user.username} already exists`);
        }
      }

      if (dto.user?.email) {
        const emailCheck = await this.userService.findByFields({
          where: { email: dto.user.email },
        });
        if (emailCheck && existing.user.id !== emailCheck.id) {
          throw new BadRequestException(`User with email ${dto.user.email} already exists`);
        }
      }

      if (dto.user) {
        dto.user.id = existing.user.id;
      }

      const mappedDriver = await mapUpdateDriverDtoToEntity(dto);
      const driver = await this.driverService.update(mappedDriver, user?.email);

      // Optional: update contacts (phone numbers) similar to POST transaction
      if (contacts && contacts.length > 0) {
        // Remove existing contacts for this user
        const existingContacts = (await this.contactService.find({
          where: { user: { id: existing.user.id } } as any,
        })) as Contact[] | null;

        if (existingContacts && existingContacts.length > 0) {
          for (const contact of existingContacts) {
            await this.contactService.delete(contact.id);
          }
        }

        // Create new contacts with updated phone values
        const mappedContacts = mapCreateContactDtoToEntity(
          contacts.map((c) => ({ ...c, userId: existing.user.id }) as any),
        ) as Contact[];
        await this.contactService.save(mappedContacts, user?.email);
      }

      return driver as unknown as UpdateDriverDTO;
    });

    return updated;
  }

  @Delete('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Soft delete driver' })
  async delete(@Param('id') id: number, @AuthUser() user: UserDTO): Promise<void> {
    const existing = await this.driverService.findById(id);
    if (!existing) throw new NotFoundException(`Driver with id ${id} not found`);
    await this.driverService.softDelete(existing.id, user?.email);
  }

  private resolveContacts(
    dto: CreateDriverDTO | UpdateDriverDTO,
  ): DriverContactPayload[] | undefined {
    const topLevel = (dto as CreateDriverDTO).contacts;
    if (topLevel && topLevel.length > 0) {
      return topLevel;
    }

    const nested = dto.user?.contacts as DriverContactPayload[] | undefined;
    if (nested && nested.length > 0) {
      return nested;
    }

    return undefined;
  }
}
