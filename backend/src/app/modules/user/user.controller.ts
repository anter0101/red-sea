import {
  Controller,
  Get,
  Logger,
  Query,
  Req,
  UseGuards,
  Post,
  Put,
  Delete,
  Body,
  Param,
  NotFoundException,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard, Roles, RolesGuard, AuthUser } from 'src/core/security';
import { UserDTO } from './dtos/user.dto';
import { UserRole } from 'src/core/enums/user-role';
import { PageRequest, pageRequestSortString } from 'src/core/utils/pagination.entity';
import { HeaderUtil } from 'src/core/utils/header-util';
import type { Request } from 'src/core/utils/request';
import { mapUserToUserDtoSelective, mapUserUpdateDtoToEntity } from './user.mapper';
import { UpdateUserDTO } from './dtos/update-user.dto';
import { User } from './user.entity';
import { UserQueryDTO } from './dtos/user-query.dto';
import { CreateUserDTO } from './dtos/create-user.dto';
import { mapUserCreateDtoToEntity } from './user.mapper';
import { FindOptionsWhere, DataSource, In, Not } from 'typeorm';
import { ContactService } from '../contact/contact.service';
import { mapCreateContactDtoToEntity } from '../contact/contact.mapper';
import { Contact } from '../contact/contact.entity';
import { withTransaction } from 'src/core/utils/transaction';
import { AccountService } from '../account/account.service';
import {
  buildPersonAccountName,
  PERSON_ACCOUNT_PARENTS,
} from '../account/person-account.constants';
import { UserStatsDTO } from './dtos/user-stats.dto';

@Controller('api/users')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('users-module')
export class UserController {
  logger = new Logger('UsersController');

  constructor(
    private readonly userService: UserService,
    private readonly contactService: ContactService,
    private readonly accountService: AccountService,
    private readonly dataSource: DataSource,
  ) {}

  @Get('/')
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.DATA_ENTRY)
  @ApiOperation({ summary: 'Get the list of users paginated' })
  @ApiResponse({
    status: 200,
    description: 'List all users',
    type: UserDTO,
    isArray: true,
  })
  async getAllUsers(@Req() req: Request, @Query() query: UserQueryDTO): Promise<UpdateUserDTO[]> {
    const pageRequest = new PageRequest(
      +(query.page ?? 1),
      +(query.pageSize ?? 10),
      pageRequestSortString(query.sortField, query.sortOrder),
    );

    const whereConditions: FindOptionsWhere<User> = {};
    if (query.role) {
      whereConditions.role = query.role;
    }

    const [results, count] = await this.userService.findAndCount(
      {
        skip: +pageRequest.page * pageRequest.size,
        take: +pageRequest.size,
        order: pageRequest.sort.asOrder(),
        relations: ['contacts', 'salary'],
        where: whereConditions ?? null,
      },
      query,
    );

    const userDtos = mapUserToUserDtoSelective(results);

    HeaderUtil.addPaginationHeaders(
      req.res!,
      count,
      pageRequest.page,
      count > pageRequest.page * pageRequest.size,
    );

    return userDtos;
  }

  @Get('/stats')
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.DATA_ENTRY)
  @ApiOperation({ summary: 'User list KPI counts by status' })
  @ApiResponse({ status: 200, description: 'User stats', type: UserStatsDTO })
  async getUserStats(@Query('role') role?: UserRole): Promise<UserStatsDTO> {
    return this.userService.getStats(role);
  }

  @Get('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get user by id' })
  @ApiResponse({ status: 200, description: 'User found', type: UserDTO })
  async getUserById(@Param('id', ParseIntPipe) id: number): Promise<UpdateUserDTO> {
    const existing = await this.userService.find({
      where: { id },
      relations: ['contacts', 'salary', 'userAttachments'],
    });

    if (!existing) throw new NotFoundException(`User with id ${id} not found`);

    const [enriched] = await this.userService.enrichAssistantsWithCurrentJourneys([existing]);

    return mapUserToUserDtoSelective(enriched, [
      'id',
      'email',
      'username',
      'status',
      'role',
      'firstName',
      'lastName',
      'personalId',
      'personalIdExpiryDate',
      'notes',
      'contacts',
      'salary',
      'userAttachments',
      'code',
      'currentJourneyId',
      'currentCarId',
      'currentCarCode',
    ]);
  }

  @Post('/')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
    type: UserDTO,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async create(@Body() createUserDTO: CreateUserDTO, @AuthUser() user: User): Promise<UserDTO> {
    if (createUserDTO.email) {
      const emailCheck = await this.userService.findByFields({
        where: { email: createUserDTO.email },
      });

      if (emailCheck) {
        throw new BadRequestException(`User with email ${createUserDTO.email} already exists`);
      }
    }

    // Validate contacts for duplicate phone numbers in payload before any DB writes
    const contacts = (createUserDTO as any).contacts as { phone: string }[] | undefined;
    if (contacts && contacts.length > 0) {
      const hasDuplicates = contacts.some(
        (contact, index) => contacts.findIndex((c) => c.phone === contact.phone) !== index,
      );

      if (hasDuplicates) {
        throw new BadRequestException('Duplicate contact phone numbers found');
      }

      // Validate that none of these phones already exist for any user
      const phones = contacts.map((c) => c.phone);
      const contactOfOtherUser = (await this.contactService.find({
        where: { phone: In(phones) },
      })) as Contact[] | null;

      if (contactOfOtherUser && contactOfOtherUser.length > 0) {
        throw new BadRequestException('Duplicate contact phone numbers found');
      }
    }

    const created = await withTransaction(this.dataSource, async (manager) => {
      const mappedUser = await mapUserCreateDtoToEntity(createUserDTO);
      const savedUser = await this.userService.save(mappedUser, user?.email);

      if (contacts && contacts.length > 0) {
        const mappedContacts = mapCreateContactDtoToEntity(
          contacts.map((c) => ({ ...c, userId: savedUser.id }) as any),
        ) as Contact[];
        await this.contactService.save(mappedContacts, user?.email);
      }

      if (savedUser.role === UserRole.DRIVER_ASSISTANT) {
        const personName = buildPersonAccountName(
          savedUser.firstName,
          savedUser.lastName,
          `Assistant ${savedUser.id}`,
        );
        await this.accountService.createPersonSubAccounts(
          personName,
          PERSON_ACCOUNT_PARENTS[UserRole.DRIVER_ASSISTANT]!,
          user?.email,
          manager,
        );
      }

      return savedUser;
    });

    return created;
  }

  @Put('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update an existing user' })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully updated.',
    type: UserDTO,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() userDTO: UpdateUserDTO,
    @AuthUser() user: User,
  ): Promise<UpdateUserDTO> {
    const existing = await this.userService.findById(id);
    if (!existing) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    // Extract and validate contacts (if provided) before any DB writes
    const contacts = (userDTO as any).contacts as { phone: string }[] | undefined;
    if (contacts && contacts.length > 0) {
      const hasDuplicates = contacts.some(
        (contact, index) => contacts.findIndex((c) => c.phone === contact.phone) !== index,
      );

      if (hasDuplicates) {
        throw new BadRequestException('Duplicate contact phone numbers found');
      }

      // Validate that none of these phones already exist for a *different* user
      const phones = contacts.map((c) => c.phone);
      const contactOfOtherUser = (await this.contactService.find({
        where: { phone: In(phones), user: { id: Not(id) } },
      })) as Contact[] | null;

      if (contactOfOtherUser && contactOfOtherUser.length > 0) {
        throw new BadRequestException('Duplicate contact phone numbers found');
      }
    }

    const updated = await withTransaction(this.dataSource, async () => {
      const mappedUser = await mapUserUpdateDtoToEntity(userDTO);

      if (mappedUser.username) {
        const usernameCheck = await this.userService.findByFields({
          where: { username: userDTO.username },
        });

        if (usernameCheck && usernameCheck.id !== id) {
          throw new BadRequestException(`User with username ${userDTO.username} already exists`);
        }
      }

      if (mappedUser.email) {
        const emailCheck = await this.userService.findByFields({
          where: { email: userDTO.email },
        });

        if (emailCheck && emailCheck.id !== id) {
          throw new BadRequestException(`User with email ${userDTO.email} already exists`);
        }
      }

      userDTO.id = id;
      const result = await this.userService.update(userDTO, user?.email);

      if (contacts && contacts.length > 0) {
        const existingContacts = (await this.contactService.find({
          where: { user: { id } },
        })) as Contact[] | null;

        if (existingContacts && existingContacts.length > 0) {
          for (const contact of existingContacts) {
            await this.contactService.delete(contact.id);
          }
        }

        const mappedContacts = mapCreateContactDtoToEntity(
          contacts.map((c) => ({ ...c, userId: id }) as any),
        ) as Contact[];
        await this.contactService.save(mappedContacts, user?.email);
      }

      return result;
    });

    return updated;
  }

  @Delete('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Soft delete a user' })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully deleted.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async delete(@Param('id') id: number, @AuthUser() user: User): Promise<void> {
    const existing = await this.userService.findById(id);
    if (!existing) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    await this.userService.softDelete(existing.id, user?.email);
  }
}
