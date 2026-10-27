import { Test } from '@nestjs/testing';
import { CanActivate, ExecutionContext, INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { DataSource, EntityManager } from 'typeorm';

import { AuthGuard, RolesGuard } from 'src/core/security';
import { UserRole } from 'src/core/enums/user-role';
import { UserStatus } from 'src/core/enums/user-status';
import { CustodyStatus } from 'src/core/enums/custody-status';
import { SalaryType } from 'src/core/enums/salary';

import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { UserService } from '../user/user.service';
import { BranchService } from '../branch/branch.service';
import { AccountService } from '../account/account.service';
import { ContactService } from '../contact/contact.service';
import { SalaryService } from '../salary/salary.service';
import { CustodyService } from '../custody/custody.service';
import { Employee } from './employee.entity';
import { User } from '../user/user.entity';
import { Account } from '../account/account.entity';

const authGuardMock: CanActivate = {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    req.user = { email: 'admin@admin.com', role: UserRole.ADMIN };
    return true;
  },
};

const rolesGuardMock: CanActivate = {
  canActivate: () => true,
};

function validationPipe(): ValidationPipe {
  return new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: false,
  });
}

function createEmployeeBody(overrides: Record<string, unknown> = {}) {
  return {
    branchId: 4,
    user: {
      firstName: 'Branch',
      lastName: 'Employee',
      email: 'branch.employee@test.com',
      password: 'Test123!',
      status: UserStatus.AVAILABLE,
      salary: { salaryAmount: 5000, salaryType: SalaryType.MONTHLY },
    },
    ...overrides,
  };
}

describe('EmployeeController — create and custody assign', () => {
  let app: INestApplication;
  let mockManager: EntityManager;
  let dataSource: { transaction: jest.Mock };

  let employeeService: {
    save: jest.Mock;
    find: jest.Mock;
    findAndCount: jest.Mock;
    findById: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  let userService: { findByFields: jest.Mock };
  let branchService: { findByFields: jest.Mock };
  let accountService: {
    createPersonSubAccounts: jest.Mock;
    createEmployeeCustodyAccount: jest.Mock;
    findPersonSubAccount: jest.Mock;
    getEmployeeCustodyBalance: jest.Mock;
    validateCustodyFundingAvailable: jest.Mock;
  };
  let contactService: { save: jest.Mock };
  let salaryService: { findByUserId: jest.Mock; save: jest.Mock; update: jest.Mock };
  let custodyService: { save: jest.Mock; findByFields: jest.Mock };

  const savedEmployee = {
    id: 7,
    user: {
      id: 70,
      firstName: 'Branch',
      lastName: 'Employee',
      role: UserRole.DATA_ENTRY,
      email: 'branch.employee@test.com',
    } as User,
  } as Employee;

  const mockCustodyAccount = { id: 301, name: 'Branch Employee' } as Account;

  beforeEach(async () => {
    mockManager = {} as EntityManager;

    dataSource = {
      transaction: jest.fn(async (work: (manager: EntityManager) => Promise<unknown>) =>
        work(mockManager),
      ),
    };

    employeeService = {
      save: jest.fn().mockResolvedValue(savedEmployee),
      find: jest.fn().mockResolvedValue(savedEmployee),
      findAndCount: jest.fn().mockResolvedValue([[], 0]),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    userService = {
      findByFields: jest.fn().mockResolvedValue(undefined),
    };

    branchService = {
      findByFields: jest.fn().mockResolvedValue({ id: 4 }),
    };

    accountService = {
      createPersonSubAccounts: jest.fn().mockResolvedValue(undefined),
      createEmployeeCustodyAccount: jest.fn().mockResolvedValue(undefined),
      findPersonSubAccount: jest.fn().mockResolvedValue(mockCustodyAccount),
      getEmployeeCustodyBalance: jest.fn().mockResolvedValue({ custodyAmount: 1500 }),
      validateCustodyFundingAvailable: jest.fn().mockResolvedValue(undefined),
    };

    contactService = { save: jest.fn().mockResolvedValue([]) };
    salaryService = {
      findByUserId: jest.fn().mockResolvedValue(undefined),
      save: jest.fn().mockResolvedValue({ id: 1 }),
      update: jest.fn(),
    };

    custodyService = {
      save: jest.fn().mockResolvedValue({ id: 99 }),
      findByFields: jest.fn().mockResolvedValue(undefined),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [EmployeeController],
      providers: [
        { provide: EmployeeService, useValue: employeeService },
        { provide: UserService, useValue: userService },
        { provide: BranchService, useValue: branchService },
        { provide: AccountService, useValue: accountService },
        { provide: ContactService, useValue: contactService },
        { provide: SalaryService, useValue: salaryService },
        { provide: CustodyService, useValue: custodyService },
        { provide: DataSource, useValue: dataSource },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(authGuardMock)
      .overrideGuard(RolesGuard)
      .useValue(rolesGuardMock)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(validationPipe());
    await app.init();
  });

  afterEach(async () => {
    await app?.close();
  });

  it('POST /api/employees creates employee without custody', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/employees')
      .send(createEmployeeBody())
      .expect(201);

    expect(employeeService.save).toHaveBeenCalledTimes(1);
    const savedEntity = employeeService.save.mock.calls[0][0] as Employee;
    expect(savedEntity.user.role).toBe(UserRole.DATA_ENTRY);
    expect(employeeService.save.mock.calls[0][2]).toBe(mockManager);

    expect(salaryService.findByUserId).toHaveBeenCalledWith(70, mockManager);
    expect(salaryService.save).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 70, salaryAmount: 5000 }),
      'admin@admin.com',
      mockManager,
    );

    expect(accountService.createPersonSubAccounts).toHaveBeenCalledTimes(1);
    expect(accountService.validateCustodyFundingAvailable).not.toHaveBeenCalled();
    expect(accountService.createEmployeeCustodyAccount).not.toHaveBeenCalled();
    expect(custodyService.save).not.toHaveBeenCalled();

    expect(res.body).toMatchObject({ id: 7 });
  });

  it('POST /api/employees saves contacts and salary inside the transaction', async () => {
    await request(app.getHttpServer())
      .post('/api/employees')
      .send(
        createEmployeeBody({
          user: {
            firstName: 'Branch',
            lastName: 'Employee',
            email: 'branch.with.contact@test.com',
            password: 'Test123!',
            status: UserStatus.AVAILABLE,
            salary: { salaryAmount: 8000, salaryType: SalaryType.MONTHLY },
            contacts: [{ phone: '+201553550847', isPrimary: true }],
          },
        }),
      )
      .expect(201);

    expect(contactService.save).toHaveBeenCalledTimes(1);
    expect(contactService.save.mock.calls[0][2]).toBe(mockManager);
    expect(salaryService.save).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 70, salaryAmount: 8000 }),
      'admin@admin.com',
      mockManager,
    );
  });

  it('POST /api/employees/:id/custody funds account and saves custody row', async () => {
    employeeService.find.mockResolvedValue(savedEmployee);

    await request(app.getHttpServer())
      .post('/api/employees/7/custody')
      .send({ amount: 2000 })
      .expect(201);

    expect(accountService.validateCustodyFundingAvailable).toHaveBeenCalledWith(2000);
    expect(accountService.createEmployeeCustodyAccount).toHaveBeenCalledWith(
      savedEmployee,
      2000,
      mockManager,
    );
    expect(custodyService.save).toHaveBeenCalledTimes(1);
    const custody = custodyService.save.mock.calls[0][0];
    expect(custody.employee).toBe(savedEmployee);
    expect(custody.account).toBe(mockCustodyAccount);
    expect(custody.status).toBe(CustodyStatus.ACTIVE);
  });
});
