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
import { EmployeeDTO } from './dtos/employee.dto';
import { UserRole } from 'src/core/enums/user-role';
import { UpdateEmployeeDTO } from './dtos/update-employee.dto';
import type { Request } from 'src/core/utils/request';
import { CreateEmployeeDTO } from './dtos/create-employee.dto';
import { EmployeeService } from './employee.service';
import { UserDTO } from '../user/dtos/user.dto';
import { PageRequest, pageRequestSortString } from 'src/core/utils/pagination.entity';
import {
  mapCreateEmployeeDtoToEntity,
  mapEmployeeToEmployeeDtoSelective,
  mapUpdateEmployeeDtoToEntity,
} from './employee.mapper';
import { HeaderUtil } from 'src/core/utils/header-util';
import { UserService } from '../user/user.service';
import { EmployeeQueryDTO } from './dtos/query-employee.dto';
import { FindOptionsWhere } from 'typeorm';
import { Employee } from './employee.entity';
import { BranchService } from '../branch/branch.service';
import { AccountService } from '../account/account.service';
import { AssignEmployeeCustodyDTO } from './dtos/assign-employee-custody.dto';
import { CustodyDTO } from '../custody/dtos/custody.dto';
import { DataSource } from 'typeorm';
import { withTransaction } from 'src/core/utils/transaction';
import { mapCreateContactDtoToEntity } from '../contact/contact.mapper';
import { Contact } from '../contact/contact.entity';
import { ContactService } from '../contact/contact.service';
import { SalaryService } from '../salary/salary.service';
import { NestedCreateContactDTO } from '../contact/dtos/nested-create-contact.dto';
import { SalaryDTO } from '../salary/dtos/salary.dto';
import { CustodyService } from '../custody/custody.service';
import { Custody } from '../custody/custody.entity';
import { CustodyStatus } from 'src/core/enums/custody-status';
import { EntityManager } from 'typeorm';
import {
  buildPersonAccountName,
  PERSON_ACCOUNT_PARENTS,
  ACCOUNT_PARENT_CUSTODY,
} from '../account/person-account.constants';

const CUSTODY_ELIGIBLE_ROLES = new Set<string>([UserRole.DATA_ENTRY, 'EMPLOYEE']);

function isCustodyEligibleRole(role?: string): boolean {
  return !!role && CUSTODY_ELIGIBLE_ROLES.has(role);
}

type EmployeeContactPayload = Pick<NestedCreateContactDTO, 'phone' | 'isPrimary'>;

@Controller('api/employees')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('employees-module')
export class EmployeeController {
  logger = new Logger('EmployeeController');

  constructor(
    private readonly employeeService: EmployeeService,
    private readonly userService: UserService,
    private readonly branchService: BranchService,
    private readonly accountService: AccountService,
    private readonly contactService: ContactService,
    private readonly salaryService: SalaryService,
    private readonly custodyService: CustodyService,
    private readonly dataSource: DataSource,
  ) {}

  @Get('/')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get the list of employees paginated' })
  @ApiResponse({
    status: 200,
    description: 'List all employees',
    type: EmployeeDTO,
    isArray: true,
  })
  async getAllEmployees(
    @Req() req: Request,
    @Query() query: EmployeeQueryDTO,
  ): Promise<UpdateEmployeeDTO[]> {
    const pageRequest: PageRequest = new PageRequest(
      +(query.page ?? 1),
      +(query.pageSize ?? 10),
      pageRequestSortString(query.sortField, query.sortOrder),
    );

    const whereConditions: FindOptionsWhere<Employee> = {};
    if (query.branchId) {
      whereConditions.branch = { id: query.branchId };
    }

    const [results, count] = await this.employeeService.findAndCount(
      {
        skip: +pageRequest.page * pageRequest.size,
        take: +pageRequest.size,
        order: pageRequest.sort.asOrder(),
        relations: ['user', 'user.contacts', 'user.salary'],
        where: whereConditions,
      },
      query,
    );

    const employeeDtos = await Promise.all(
      results.map(async (employee) => this.mapEmployeeWithCustody(employee, ['id', 'user'])),
    );

    HeaderUtil.addPaginationHeaders(
      req.res!,
      count,
      pageRequest.page,
      count > pageRequest.page * pageRequest.size,
    );

    return employeeDtos;
  }

  @Get('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get employee by id' })
  @ApiResponse({ status: 200, description: 'Employee found', type: EmployeeDTO })
  async getEmployeeById(@Param('id') id: number): Promise<UpdateEmployeeDTO> {
    const existing = await this.employeeService.find({
      where: { id },
      relations: ['user', 'user.contacts', 'user.salary', 'user.userAttachments'],
    });
    if (!existing) throw new NotFoundException(`Employee with id ${id} not found`);

    return this.mapEmployeeWithCustody(existing, ['id', 'user']);
  }

  @Post('/')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new employee' })
  @ApiResponse({ status: 201, description: 'Record created', type: EmployeeDTO })
  async create(
    @Body() dto: CreateEmployeeDTO,
    @AuthUser() user: UserDTO,
  ): Promise<Partial<EmployeeDTO>> {
    if (!dto.user?.email) {
      throw new BadRequestException('User email is required');
    }

    if (!dto.user?.password) {
      throw new BadRequestException('User password is required');
    }

    const emailCheck = await this.userService.findByFields({
      where: { email: dto.user.email },
    });

    if (emailCheck) {
      throw new BadRequestException(`User with email ${dto.user.email} already exists`);
    }

    const existing = await this.branchService.findByFields({
      where: { id: dto.branchId },
    });

    if (!existing) {
      throw new BadRequestException(`Branch with id ${dto.branchId} does not exist`);
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

    const saved = await withTransaction(this.dataSource, async (manager) => {
      const mappedEmployee = await mapCreateEmployeeDtoToEntity(dto);
      mappedEmployee.user.role = UserRole.DATA_ENTRY;
      mappedEmployee.user.activated = true;
      const employee = await this.employeeService.save(mappedEmployee, user?.email, manager);

      if (contacts && contacts.length > 0) {
        const mappedContacts = mapCreateContactDtoToEntity(
          contacts.map((c) => ({ ...c, userId: employee.user.id })),
        ) as Contact[];
        await this.contactService.save(mappedContacts, user?.email, manager);
      }

      await this.upsertUserSalary(employee.user.id, dto.user?.salary, user?.email, manager);

      const personName = buildPersonAccountName(
        employee.user?.firstName,
        employee.user?.lastName,
        `Employee ${employee.id}`,
      );
      await this.accountService.createPersonSubAccounts(
        personName,
        PERSON_ACCOUNT_PARENTS[UserRole.DATA_ENTRY]!,
        user?.email,
        manager,
      );

      return employee;
    });

    const reloaded = await this.employeeService.find({
      where: { id: saved.id },
      relations: ['user', 'user.contacts', 'user.salary'],
    });

    return this.mapEmployeeWithCustody(reloaded ?? saved, ['id', 'user']);
  }

  @Post('/:id/custody')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Assign initial custody to an employee' })
  @ApiResponse({ status: 201, description: 'Custody assigned', type: CustodyDTO })
  async assignCustody(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignEmployeeCustodyDTO,
    @AuthUser() user: UserDTO,
  ): Promise<{ message: string }> {
    const employee = await this.employeeService.find({
      where: { id },
      relations: ['user'],
    });

    if (!employee) {
      throw new NotFoundException(`Employee with id ${id} not found`);
    }

    if (!employee.user) {
      throw new BadRequestException(`Employee with id ${id} does not have an associated user`);
    }

    if (!isCustodyEligibleRole(employee.user.role)) {
      throw new BadRequestException('Custody can only be assigned to users with DATA_ENTRY role');
    }

    await this.accountService.validateCustodyFundingAvailable(dto.amount);

    await withTransaction(this.dataSource, async (manager) => {
      await this.assignInitialCustodyToEmployee(employee, dto.amount, user?.email, manager);
    });

    return { message: 'Custody assigned successfully' };
  }

  @Put('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update existing employee' })
  @ApiResponse({ status: 200, description: 'Record updated', type: EmployeeDTO })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmployeeDTO,
    @AuthUser() user: UserDTO,
  ): Promise<UpdateEmployeeDTO> {
    // Fetch existing employee including the user relation
    const existing = await this.employeeService.findByFields({
      where: { id },
      relations: ['user'],
    });

    if (!existing) {
      throw new NotFoundException(`Employee with id ${id} not found`);
    }

    // Ensure the employee has an associated user
    if (!existing.user) {
      throw new BadRequestException(`Employee with id ${id} does not have an associated user`);
    }

    dto.id = id; // assign id to DTO for mapping

    // Check for username uniqueness
    if (dto.user?.username) {
      const existingUser = await this.userService.findByFields({
        where: { username: dto.user.username },
      });
      if (existingUser && existing.user.id !== existingUser.id) {
        throw new BadRequestException(`User with username ${dto.user.username} already exists`);
      }
    }

    // Check for email uniqueness
    if (dto.user?.email) {
      const emailCheck = await this.userService.findByFields({
        where: { email: dto.user.email },
      });
      if (emailCheck && existing.user.id !== emailCheck.id) {
        throw new BadRequestException(`User with email ${dto.user.email} already exists`);
      }
    }

    // Assign the existing user's ID to the DTO to update the correct record
    if (dto.user) {
      dto.user.id = existing.user.id;
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

    const updated = await withTransaction(this.dataSource, async (manager) => {
      const mappedEmployee = await mapUpdateEmployeeDtoToEntity(dto);
      const employee = await this.employeeService.update(mappedEmployee, user?.email);

      if (contacts && contacts.length > 0) {
        const existingContacts = (await this.contactService.find({
          where: { user: { id: existing.user.id } },
        })) as Contact[] | null;

        if (existingContacts && existingContacts.length > 0) {
          for (const contact of existingContacts) {
            await this.contactService.delete(contact.id);
          }
        }

        const mappedContacts = mapCreateContactDtoToEntity(
          contacts.map((c) => ({ ...c, userId: existing.user.id }) as any),
        ) as Contact[];
        await this.contactService.save(mappedContacts, user?.email, manager);
      }

      await this.upsertUserSalary(existing.user.id, dto.user?.salary, user?.email, manager);

      return employee;
    });

    const reloaded = await this.employeeService.find({
      where: { id },
      relations: ['user', 'user.contacts', 'user.salary'],
    });

    return this.mapEmployeeWithCustody(reloaded ?? updated, ['id', 'user']);
  }

  @Delete('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete employee' })
  async delete(@Param('id') id: number): Promise<void> {
    const existing = await this.employeeService.findById(id);
    if (!existing) throw new NotFoundException(`Employee with id ${id} not found`);
    await this.employeeService.delete(existing.id);
  }

  private async assignInitialCustodyToEmployee(
    employee: Employee,
    amount: number,
    actor: string | undefined,
    manager: EntityManager,
  ): Promise<Custody> {
    await this.accountService.createEmployeeCustodyAccount(employee, amount, manager);

    const employeeAccount = await this.accountService.findPersonSubAccount(
      buildPersonAccountName(
        employee.user?.firstName,
        employee.user?.lastName,
        `Employee ${employee.id}`,
      ),
      ACCOUNT_PARENT_CUSTODY,
      manager,
    );

    const existing = await this.custodyService.findByFields(
      {
        where: {
          employee: { id: employee.id },
          account: { id: employeeAccount.id },
        },
      },
      manager,
    );

    if (existing) {
      return existing;
    }

    const custody = new Custody();
    custody.employee = employee;
    custody.account = employeeAccount;
    custody.status = CustodyStatus.ACTIVE;

    return this.custodyService.save(custody, actor, manager);
  }

  private resolveContacts(
    dto: CreateEmployeeDTO | UpdateEmployeeDTO,
  ): EmployeeContactPayload[] | undefined {
    const nested = dto.user?.contacts;
    if (nested && nested.length > 0) {
      return nested;
    }

    return undefined;
  }

  private async upsertUserSalary(
    userId: number,
    salary: SalaryDTO | undefined,
    actor?: string,
    manager?: EntityManager,
  ): Promise<void> {
    if (!salary?.salaryAmount || !salary?.salaryType) {
      return;
    }

    const existingSalary = await this.salaryService.findByUserId(userId, manager);
    if (existingSalary) {
      await this.salaryService.update(
        {
          id: existingSalary.id,
          salaryAmount: salary.salaryAmount,
          salaryType: salary.salaryType,
        },
        actor,
        manager,
      );
      return;
    }

    await this.salaryService.save(
      {
        userId,
        salaryAmount: salary.salaryAmount,
        salaryType: salary.salaryType,
      },
      actor,
      manager,
    );
  }

  private async resolveCustodyAmount(employee: Employee): Promise<number> {
    try {
      const balance = await this.accountService.getEmployeeCustodyBalance(employee);
      return balance.custodyAmount;
    } catch {
      return 0;
    }
  }

  private async mapEmployeeWithCustody(
    employee: Employee,
    keys: (keyof EmployeeDTO | 'id' | 'user')[],
  ): Promise<Partial<EmployeeDTO>> {
    const dto = mapEmployeeToEmployeeDtoSelective(employee, keys);
    return {
      ...dto,
      custody: await this.resolveCustodyAmount(employee),
    };
  }
}
