import { Test } from '@nestjs/testing';
import { CanActivate, ExecutionContext, INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { DataSource, EntityManager, EntityTarget } from 'typeorm';

import { AuthGuard, RolesGuard } from 'src/core/security';
import { UserRole } from 'src/core/enums/user-role';
import { JourneyVehicleMode } from 'src/core/enums/journey-vehicle-mode';
import { JourneyStatus } from 'src/core/enums/journey';
import { PackingType } from 'src/core/enums/packing-type';
import { CustodyStatus } from 'src/core/enums/custody-status';

import { JourneyController } from './journey.controller';
import { JourneyService } from './journey.service';
import { JourneyAssetsService } from './journey-assets.service';
import { DriverService } from '../driver/driver.service';
import { CarService } from '../car/car.service';
import { TrailerService } from '../trailer/trailer.service';
import { UserService } from '../user/user.service';
import { JourneyTransactionService } from '../journey-transaction/journey-transaction.service';
import { ClientService } from '../factory/client.service';
import { EmployeeService } from '../employee/employee.service';
import { AccountService } from '../account/account.service';
import { CustodyService } from '../custody/custody.service';
import { Journey } from './journey.entity';
import { Employee } from '../employee/employee.entity';
import { Driver } from '../driver/driver.entity';
import { Account } from '../account/account.entity';
import { User } from '../user/user.entity';
import { JourneyDelegationPrintService } from '../journey-delegation-print/journey-delegation-print.service';
import { JourneyRevenueService } from './journey-revenue.service';
import { NotFoundException } from '@nestjs/common';
import { ACCOUNT_PARENT_CUSTODY } from '../account/person-account.constants';

const EMPLOYEE_USER_ID = 10;

const authGuardMock: CanActivate = {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    req.user = {
      id: EMPLOYEE_USER_ID,
      email: 'employee@test.com',
      role: UserRole.DATA_ENTRY,
    };
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

function officeCreateBody(overrides: Record<string, unknown> = {}) {
  return {
    vehicleMode: JourneyVehicleMode.COMPANY_CAR,
    clientId: 1,
    direction: 'Alexandria',
    packingType: PackingType.BAGGED,
    quantity: 80,
    driverId: 1,
    carId: 2,
    trailerId: 2,
    receivedCompany: 'Factory Co',
    sellingOrderNo: 'SO-002',
    tripStatus: JourneyStatus.DELEGATION_ISSUED,
    ...overrides,
  };
}

const MODE_BODIES: Record<JourneyVehicleMode, Record<string, unknown>> = {
  [JourneyVehicleMode.COMPANY_CAR]: {
    vehicleMode: JourneyVehicleMode.COMPANY_CAR,
    clientId: 1,
    direction: 'Cairo',
    packingType: PackingType.BAGGED,
    cementGrade: '42.5',
    quantity: 120,
    custodyAmount: 5000,
    driverAssistantId: 4,
    driverId: 1,
    carId: 1,
    trailerId: 1,
    receivedCompany: 'ACME',
    sellingOrderNo: 'SO-001',
    tripStatus: JourneyStatus.DELEGATION_ISSUED,
  },
  [JourneyVehicleMode.CONTRACT_CAR]: {
    vehicleMode: JourneyVehicleMode.CONTRACT_CAR,
    clientId: 1,
    direction: 'Alexandria',
    packingType: PackingType.BAGGED,
    quantity: 80,
    driverId: 1,
    carId: 2,
    trailerId: 2,
    receivedCompany: 'Factory Co',
    sellingOrderNo: 'SO-002',
    tripStatus: JourneyStatus.DELEGATION_ISSUED,
  },
  [JourneyVehicleMode.NOLON_CAR]: {
    vehicleMode: JourneyVehicleMode.NOLON_CAR,
    clientId: 1,
    direction: 'Giza',
    packingType: PackingType.BAGGED,
    quantity: 50,
    custodyAmount: 3000,
    driverId: 1,
    carId: 3,
    trailerId: 1,
    receivedCompany: 'Rental Client',
    sellingOrderNo: 'SO-003',
    tripStatus: JourneyStatus.DELEGATION_ISSUED,
  },
};

describe('JourneyController — POST /api/journeys/office', () => {
  let app: INestApplication;
  let mockManager: { findOne: jest.Mock };
  let dataSource: { transaction: jest.Mock };

  let journeyService: {
    save: jest.Mock;
    findAndCount: jest.Mock;
    findById: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    findByFields: jest.Mock;
    getJourneyEmployees: jest.Mock;
    getJourneyVehicles: jest.Mock;
    getJourneyInfo: jest.Mock;
    getJourneyDetailsById: jest.Mock;
  };
  let journeyAssetsService: { resolveForCreate: jest.Mock; resolveForUpdate: jest.Mock };
  let journeyTransactionService: { save: jest.Mock };
  let clientService: { findById: jest.Mock };
  let accountService: { custodyMovement: jest.Mock; findPersonSubAccount: jest.Mock };
  let custodyService: { save: jest.Mock };
  let userService: { findByFields: jest.Mock };
  let journeyDelegationPrintService: { createForJourney: jest.Mock };

  const mockEmployee = {
    id: 5,
    user: { id: EMPLOYEE_USER_ID, firstName: 'Office', lastName: 'Employee' } as User,
  } as Employee;

  const mockDriver = {
    id: 1,
    user: { id: 20, firstName: 'Trip', lastName: 'Driver' } as User,
  } as Driver;

  const mockEmpAccount = { id: 100, name: 'Office Employee' } as Account;
  const mockDriverAccount = { id: 200, name: 'Trip Driver' } as Account;

  const savedJourney = {
    id: 42,
    direction: 'Alexandria',
    tripStatus: JourneyStatus.DELEGATION_ISSUED,
    sellingOrderNo: 'SO-002',
  } as Journey;

  beforeEach(async () => {
    mockManager = { findOne: jest.fn() };
    dataSource = {
      transaction: jest.fn(async (work: (manager: EntityManager) => Promise<unknown>) =>
        work(mockManager as unknown as EntityManager),
      ),
    };

    journeyService = {
      save: jest.fn().mockResolvedValue(savedJourney),
      findAndCount: jest.fn().mockResolvedValue([[], 0]),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByFields: jest.fn(),
      getJourneyEmployees: jest.fn(),
      getJourneyVehicles: jest.fn(),
      getJourneyInfo: jest.fn(),
      getJourneyDetailsById: jest.fn(),
    };

    journeyAssetsService = {
      resolveForCreate: jest.fn().mockResolvedValue({
        driverId: 1,
        carId: 2,
        trailerId: 2,
      }),
      resolveForUpdate: jest.fn(),
    };

    journeyTransactionService = { save: jest.fn().mockResolvedValue({ id: 1 }) };
    clientService = { findById: jest.fn().mockResolvedValue({ id: 1 }) };
    accountService = {
      custodyMovement: jest.fn().mockResolvedValue(undefined),
      findPersonSubAccount: jest.fn(),
    };
    custodyService = { save: jest.fn().mockResolvedValue({ id: 1 }) };
    userService = { findByFields: jest.fn().mockResolvedValue({ id: 4 }) };
    journeyDelegationPrintService = { createForJourney: jest.fn().mockResolvedValue(undefined) };

    accountService.findPersonSubAccount.mockImplementation(
      async (personName: string, parentName: string) => {
        if (parentName !== ACCOUNT_PARENT_CUSTODY) {
          throw new NotFoundException(`Parent account "${parentName}" not found`);
        }
        if (personName === 'Office Employee') return mockEmpAccount;
        if (personName === 'Trip Driver') return mockDriverAccount;
        throw new NotFoundException(
          `Account for "${personName}" under "${parentName}" not found`,
        );
      },
    );

    mockManager.findOne.mockImplementation(
      async (entity: EntityTarget<unknown>, options?: { where?: Record<string, unknown> }) => {
        if (entity === Employee) {
          const userId = (options?.where as { user?: { id?: number } })?.user?.id;
          return userId === EMPLOYEE_USER_ID ? mockEmployee : null;
        }
        if (entity === Driver) {
          const id = (options?.where as { id?: number })?.id;
          return id === mockDriver.id ? mockDriver : null;
        }
        return null;
      },
    );

    const moduleRef = await Test.createTestingModule({
      controllers: [JourneyController],
      providers: [
        { provide: JourneyService, useValue: journeyService },
        { provide: JourneyAssetsService, useValue: journeyAssetsService },
        { provide: DriverService, useValue: {} },
        { provide: CarService, useValue: {} },
        { provide: TrailerService, useValue: {} },
        { provide: UserService, useValue: userService },
        { provide: JourneyTransactionService, useValue: journeyTransactionService },
        { provide: ClientService, useValue: clientService },
        { provide: EmployeeService, useValue: {} },
        { provide: AccountService, useValue: accountService },
        { provide: CustodyService, useValue: custodyService },
        { provide: JourneyDelegationPrintService, useValue: journeyDelegationPrintService },
        { provide: JourneyRevenueService, useValue: { applyExpected: jest.fn(), applyExpectedForJourney: jest.fn(), applyFromPolicy: jest.fn() } },
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

  it('creates a journey without custody and returns mapped dto', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/journeys/office')
      .send(officeCreateBody())
      .expect(201);

    expect(journeyAssetsService.resolveForCreate).toHaveBeenCalledTimes(1);
    expect(journeyAssetsService.resolveForCreate.mock.calls[0][0]).toMatchObject({
      vehicleMode: JourneyVehicleMode.COMPANY_CAR,
      clientId: 1,
    });
    expect(clientService.findById).toHaveBeenCalledWith(1);
    expect(journeyService.save).toHaveBeenCalledTimes(1);
    expect(journeyTransactionService.save).not.toHaveBeenCalled();
    expect(accountService.custodyMovement).not.toHaveBeenCalled();
    expect(custodyService.save).not.toHaveBeenCalled();
    expect(res.body).toMatchObject({
      id: 42,
      direction: 'Alexandria',
      sellingOrderNo: 'SO-002',
    });
  });

  it('creates custody transaction, account movement, and custody record when custodyAmount > 0', async () => {
    await request(app.getHttpServer())
      .post('/api/journeys/office')
      .send(officeCreateBody({ custodyAmount: 5000 }))
      .expect(201);

    expect(journeyTransactionService.save).toHaveBeenCalledTimes(1);
    const tx = journeyTransactionService.save.mock.calls[0][0];
    expect(tx.amount).toBe(5000);
    expect(tx.journey).toBe(savedJourney);

    expect(accountService.findPersonSubAccount).toHaveBeenCalledWith(
      'Office Employee',
      ACCOUNT_PARENT_CUSTODY,
      mockManager,
    );
    expect(accountService.findPersonSubAccount).toHaveBeenCalledWith(
      'Trip Driver',
      ACCOUNT_PARENT_CUSTODY,
      mockManager,
    );
    expect(accountService.custodyMovement).toHaveBeenCalledWith(
      mockEmpAccount,
      mockDriverAccount,
      5000,
      mockManager,
    );

    expect(custodyService.save).toHaveBeenCalledTimes(1);
    const custody = custodyService.save.mock.calls[0][0];
    expect(custody.status).toBe(CustodyStatus.ACTIVE);
    expect(custody.employee).toBe(mockEmployee);
    expect(custody.driver).toBe(mockDriver);
    expect(custody.journey).toBe(savedJourney);
    expect(custody.account).toBe(mockDriverAccount);
  });

  it('returns 404 when employee for authenticated user is not found', async () => {
    mockManager.findOne.mockImplementation(async (entity: EntityTarget<unknown>) => {
      if (entity === Employee) return null;
      if (entity === Driver) return mockDriver;
      return null;
    });

    const res = await request(app.getHttpServer())
      .post('/api/journeys/office')
      .send(officeCreateBody())
      .expect(404);

    expect(res.body.message).toContain(`Employee with user id ${EMPLOYEE_USER_ID} not found`);
    expect(journeyService.save).not.toHaveBeenCalled();
  });

  it('returns 404 when driver is not found', async () => {
    mockManager.findOne.mockImplementation(async (entity: EntityTarget<unknown>) => {
      if (entity === Employee) return mockEmployee;
      if (entity === Driver) return null;
      return null;
    });

    const res = await request(app.getHttpServer())
      .post('/api/journeys/office')
      .send(officeCreateBody())
      .expect(404);

    expect(res.body.message).toContain('Driver with id 1 not found');
    expect(journeyService.save).not.toHaveBeenCalled();
  });

  it('returns 404 when client id is invalid', async () => {
    clientService.findById.mockResolvedValue(undefined);

    const res = await request(app.getHttpServer())
      .post('/api/journeys/office')
      .send(officeCreateBody())
      .expect(404);

    expect(res.body.message).toContain('Client with id 1 not found');
    expect(journeyService.save).not.toHaveBeenCalled();
  });

  it('returns 404 when employee account is missing for custody', async () => {
    accountService.findPersonSubAccount.mockImplementation(async (personName: string) => {
      if (personName === 'Trip Driver') return mockDriverAccount;
      throw new NotFoundException(
        `Account for "${personName}" under "${ACCOUNT_PARENT_CUSTODY}" not found`,
      );
    });

    const res = await request(app.getHttpServer())
      .post('/api/journeys/office')
      .send(officeCreateBody({ custodyAmount: 1000 }))
      .expect(404);

    expect(res.body.message).toContain('Account for "Office Employee" under "عهد" not found');
    expect(custodyService.save).not.toHaveBeenCalled();
  });

  it('returns 404 when driver account is missing for custody', async () => {
    accountService.findPersonSubAccount.mockImplementation(async (personName: string) => {
      if (personName === 'Office Employee') return mockEmpAccount;
      throw new NotFoundException(
        `Account for "${personName}" under "${ACCOUNT_PARENT_CUSTODY}" not found`,
      );
    });

    const res = await request(app.getHttpServer())
      .post('/api/journeys/office')
      .send(officeCreateBody({ custodyAmount: 1000 }))
      .expect(404);

    expect(res.body.message).toContain('Account for "Trip Driver" under "عهد" not found');
    expect(custodyService.save).not.toHaveBeenCalled();
  });

  it('propagates asset resolution errors from JourneyAssetsService', async () => {
    journeyAssetsService.resolveForCreate.mockRejectedValue(
      new Error('Car ownerShip must be COMPANY_CAR for COMPANY_CAR (got CONTRACT_CAR)'),
    );

    await request(app.getHttpServer())
      .post('/api/journeys/office')
      .send(officeCreateBody())
      .expect(500);

    expect(journeyService.save).not.toHaveBeenCalled();
  });

  it('rejects invalid vehicleMode', async () => {
    await request(app.getHttpServer())
      .post('/api/journeys/office')
      .send(officeCreateBody({ vehicleMode: 'INVALID_MODE' }))
      .expect(400);

    expect(journeyAssetsService.resolveForCreate).not.toHaveBeenCalled();
  });

  describe('all vehicle modes (DTO + controller flow)', () => {
    it.each([
      JourneyVehicleMode.COMPANY_CAR,
      JourneyVehicleMode.CONTRACT_CAR,
      JourneyVehicleMode.NOLON_CAR,
    ])('accepts %s payload and passes dto to resolveForCreate', async (mode) => {
      journeyAssetsService.resolveForCreate.mockResolvedValue({
        driverId: 1,
        carId: 2,
        trailerId: 2,
      });

      await request(app.getHttpServer())
        .post('/api/journeys/office')
        .send(MODE_BODIES[mode])
        .expect(201);

      expect(journeyAssetsService.resolveForCreate).toHaveBeenCalledWith(
        expect.objectContaining({ vehicleMode: mode, clientId: 1 }),
        mockManager,
        'employee@test.com',
      );
      expect(journeyService.save).toHaveBeenCalled();
    });
  });

  describe('NOLON_CAR nested assignment DTO', () => {
    it('accepts driver/car/trailer.id without flat ids', async () => {
      await request(app.getHttpServer())
        .post('/api/journeys/office')
        .send({
          vehicleMode: JourneyVehicleMode.NOLON_CAR,
          clientId: 1,
          direction: 'Giza',
          packingType: PackingType.BAGGED,
          quantity: 50,
          driver: { id: 1 },
          car: { id: 3 },
          trailer: { id: 1 },
          receivedCompany: 'Rental',
          sellingOrderNo: 'SO-NOLON-NESTED',
        })
        .expect(201);

      const passedDto = journeyAssetsService.resolveForCreate.mock.calls[0][0];
      expect(passedDto.vehicleMode).toBe(JourneyVehicleMode.NOLON_CAR);
      expect(passedDto.driver?.id ?? (passedDto.driver as { id?: number })?.id).toBe(1);
      expect(passedDto.car?.id ?? (passedDto.car as { id?: number })?.id).toBe(3);
      expect(passedDto.trailer?.id ?? (passedDto.trailer as { id?: number })?.id).toBe(1);
    });
  });

  describe('DTO validation (HTTP 400)', () => {
    it('rejects body without vehicleMode', async () => {
      const { vehicleMode: _, ...body } = officeCreateBody();
      await request(app.getHttpServer()).post('/api/journeys/office').send(body).expect(400);
      expect(journeyAssetsService.resolveForCreate).not.toHaveBeenCalled();
    });

    it('rejects body without clientId', async () => {
      const { clientId: _, ...body } = officeCreateBody();
      await request(app.getHttpServer()).post('/api/journeys/office').send(body).expect(400);
      expect(journeyAssetsService.resolveForCreate).not.toHaveBeenCalled();
    });

    it('rejects invalid packingType', async () => {
      await request(app.getHttpServer())
        .post('/api/journeys/office')
        .send(officeCreateBody({ packingType: 'NOT_A_PACKING' }))
        .expect(400);
    });

    it('rejects non-numeric clientId', async () => {
      await request(app.getHttpServer())
        .post('/api/journeys/office')
        .send(officeCreateBody({ clientId: 'abc' }))
        .expect(400);
    });
  });

  describe('custody edge cases', () => {
    it('skips custody flow when custodyAmount is 0', async () => {
      await request(app.getHttpServer())
        .post('/api/journeys/office')
        .send(officeCreateBody({ custodyAmount: 0 }))
        .expect(201);

      expect(journeyTransactionService.save).not.toHaveBeenCalled();
      expect(custodyService.save).not.toHaveBeenCalled();
    });

    it('skips custody flow when custodyAmount is omitted', async () => {
      const { custodyAmount: _, ...body } = officeCreateBody({ custodyAmount: 5000 });
      await request(app.getHttpServer()).post('/api/journeys/office').send(body).expect(201);
      expect(custodyService.save).not.toHaveBeenCalled();
    });
  });

  describe('driverAssistantId validation', () => {
    it('returns 404 when assistant driver is not found', async () => {
      userService.findByFields.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .post('/api/journeys/office')
        .send(officeCreateBody({ driverAssistantId: 99 }))
        .expect(404);

      expect(res.body.message).toContain('Assistant driver with id 99 not found');
      expect(journeyService.save).not.toHaveBeenCalled();
    });
  });
});

describe('JourneyController — GET /api/journeys/stats', () => {
  let app: INestApplication;

  const journeyService = {
    getStats: jest.fn().mockResolvedValue({
      total: 5,
      journeyCount: 5,
      byStatus: [],
      totalDistance: 100,
      totalBookWeight: 200,
    }),
    findAndCount: jest.fn(),
    save: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findByFields: jest.fn(),
    getJourneyEmployees: jest.fn(),
    getJourneyVehicles: jest.fn(),
    getJourneyInfo: jest.fn(),
    getJourneyDetailsById: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [JourneyController],
      providers: [
        { provide: JourneyService, useValue: journeyService },
        { provide: JourneyAssetsService, useValue: { resolveForCreate: jest.fn(), resolveForUpdate: jest.fn() } },
        { provide: DriverService, useValue: { findById: jest.fn() } },
        { provide: UserService, useValue: { findByFields: jest.fn() } },
        { provide: CarService, useValue: { findById: jest.fn() } },
        { provide: TrailerService, useValue: { findById: jest.fn() } },
        { provide: JourneyTransactionService, useValue: { save: jest.fn() } },
        { provide: ClientService, useValue: { findById: jest.fn() } },
        { provide: EmployeeService, useValue: { findByFields: jest.fn() } },
        { provide: AccountService, useValue: { custodyMovement: jest.fn(), findPersonSubAccount: jest.fn() } },
        { provide: CustodyService, useValue: { save: jest.fn() } },
        { provide: DataSource, useValue: { transaction: jest.fn() } },
        { provide: JourneyDelegationPrintService, useValue: { createForJourney: jest.fn() } },
        { provide: JourneyRevenueService, useValue: { applyExpected: jest.fn(), applyExpectedForJourney: jest.fn(), applyFromPolicy: jest.fn() } },
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
    await app.close();
    jest.clearAllMocks();
  });

  it('returns stats with the same query filters', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/journeys/stats')
      .query({ driverId: 3, tripStatus: JourneyStatus.DELEGATION_ISSUED })
      .expect(200);

    expect(res.body.total).toBe(5);
    expect(journeyService.getStats).toHaveBeenCalledWith(
      expect.objectContaining({ driverId: 3, tripStatus: JourneyStatus.DELEGATION_ISSUED }),
      { custodySourceUserId: EMPLOYEE_USER_ID },
    );
  });
});
