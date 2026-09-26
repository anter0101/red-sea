/**
 * Smoke: FE list get-all endpoints return non-5xx with mocked services.
 * Grid by-page-key must return 200 (not 404) when prefs are missing.
 */
import { Test } from '@nestjs/testing';
import { CanActivate, ExecutionContext, Type } from '@nestjs/common';
import request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { AuthGuard, RolesGuard } from 'src/core/security';
import { UserRole } from 'src/core/enums/user-role';

import { GridsController } from './grid/grid.controller';
import { GridsService } from './grid/grid.service';
import { CarController } from './car/car.controller';
import { CarService } from './car/car.service';
import { ClientController } from './factory/client.controller';
import { ClientService } from './factory/client.service';
import { SupplierController } from './supplier/supplier.controller';
import { SupplierService } from './supplier/supplier.service';
import { GovernmentService } from './government/government.service';
import { TrailerController } from './trailer/trailer.controller';
import { TrailerService } from './trailer/trailer.service';
import { AxleService } from './axle/axle.service';
import { WarehouseController } from './warehouse/warehouse.controller';
import { WarehouseService } from './warehouse/warehouse.service';
import { WarehouseStockMovementService } from './warehouse/warehouse-stock-movement.service';
import { GpsDeviceController } from './gps-device/gps-device.controller';
import { GpsDeviceService } from './gps-device/gps-device.service';
import { BranchController } from './branch/branch.controller';
import { BranchService } from './branch/branch.service';
import { SalaryController } from './salary/salary.controller';
import { SalaryService } from './salary/salary.service';
import { UserService } from './user/user.service';
import { UserController } from './user/user.controller';
import { ContactService } from './contact/contact.service';
import { AccountService } from './account/account.service';
import { PriceTypeController } from './price-type/price-type.controller';
import { PriceTypeService } from './price-type/price-type.service';
import { TireModelController } from './tire-model/tire-model.controller';
import { TireModelService } from './tire-model/tire-model.service';
import { TransactionLineController } from './transaction-line/transaction-line.controller';
import { TransactionLineService } from './transaction-line/transaction-line.service';
import { MaintenanceController } from './maintenance/maintenance.controller';
import { MaintenanceService } from './maintenance/maintenance.service';
import { PhysicalAttachmentController } from './physical-attachment/physical-attachment.controller';
import { PhysicalAttachmentService } from './physical-attachment/physical-attachment.service';
import { DriverController } from './driver/driver.controller';
import { DriverService } from './driver/driver.service';
import { OwnerController } from './owner/owner.controller';
import { OwnerService } from './owner/owner.service';
import { RelCarOwnerService } from './rel-car-owner/rel-car-owner.services';
import { RelTrailerOwnerService } from './rel-trailer-owner/rel-trailer-owner.services';
import { EmployeeController } from './employee/employee.controller';
import { EmployeeService } from './employee/employee.service';
import { CustodyController } from './custody/custody.controller';
import { CustodyService } from './custody/custody.service';
import { JourneyController } from './journey/journey.controller';
import { JourneyService } from './journey/journey.service';
import { JourneyAssetsService } from './journey/journey-assets.service';
import { JourneyTransactionService } from './journey-transaction/journey-transaction.service';
import { JourneyDelegationPrintService } from './journey-delegation-print/journey-delegation-print.service';
import { JourneyRevenueService } from './journey/journey-revenue.service';
import { OfficeRequestController } from './office-request/office-request.controller';
import { OfficeRequestService } from './office-request/office-request.service';
import { Car } from './car/car.entity';
import { Trailer } from './trailer/trailer.entity';

const authGuardMock: CanActivate = {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    req.user = { id: 1, email: 'admin@test.com', role: UserRole.ADMIN };
    return true;
  },
};

const rolesGuardMock: CanActivate = {
  canActivate: () => true,
};

const emptyFindAndCount = () => jest.fn().mockResolvedValue([[], 0]);
const stub = () => ({});

type SmokeCase = {
  path: string;
  controllers: Type<unknown>[];
  providers: { provide: unknown; useValue: Record<string, unknown> }[];
};

const cases: SmokeCase[] = [
  {
    path: '/api/cars',
    controllers: [CarController],
    providers: [{ provide: CarService, useValue: { findAndCount: emptyFindAndCount() } }],
  },
  {
    path: '/api/clients',
    controllers: [ClientController],
    providers: [{ provide: ClientService, useValue: { findAndCount: emptyFindAndCount() } }],
  },
  {
    path: '/api/suppliers',
    controllers: [SupplierController],
    providers: [
      { provide: SupplierService, useValue: { findAndCount: emptyFindAndCount() } },
      { provide: GovernmentService, useValue: stub() },
    ],
  },
  {
    path: '/api/trailers',
    controllers: [TrailerController],
    providers: [
      { provide: TrailerService, useValue: { findAndCount: emptyFindAndCount() } },
      { provide: AxleService, useValue: stub() },
    ],
  },
  {
    path: '/api/warehouses',
    controllers: [WarehouseController],
    providers: [
      { provide: WarehouseService, useValue: { findAndCount: emptyFindAndCount() } },
      {
        provide: WarehouseStockMovementService,
        useValue: { getLastOutDatesByWarehouseIds: jest.fn().mockResolvedValue(new Map()) },
      },
      { provide: SupplierService, useValue: stub() },
    ],
  },
  {
    path: '/api/gps-devices',
    controllers: [GpsDeviceController],
    providers: [
      { provide: GpsDeviceService, useValue: { findAndCount: emptyFindAndCount() } },
      { provide: CarService, useValue: stub() },
    ],
  },
  {
    path: '/api/branches',
    controllers: [BranchController],
    providers: [{ provide: BranchService, useValue: { findAndCount: emptyFindAndCount() } }],
  },
  {
    path: '/api/salaries',
    controllers: [SalaryController],
    providers: [
      { provide: SalaryService, useValue: { findAndCount: emptyFindAndCount() } },
      { provide: UserService, useValue: stub() },
    ],
  },
  {
    path: '/api/price-types',
    controllers: [PriceTypeController],
    providers: [{ provide: PriceTypeService, useValue: { findAndCount: emptyFindAndCount() } }],
  },
  {
    path: '/api/tire-models',
    controllers: [TireModelController],
    providers: [{ provide: TireModelService, useValue: { findAndCount: emptyFindAndCount() } }],
  },
  {
    path: '/api/accounting/transaction-lines',
    controllers: [TransactionLineController],
    providers: [
      { provide: TransactionLineService, useValue: { findAndCount: emptyFindAndCount() } },
    ],
  },
  {
    path: '/api/maintenances',
    controllers: [MaintenanceController],
    providers: [
      { provide: MaintenanceService, useValue: { findAndCount: emptyFindAndCount() } },
      { provide: getRepositoryToken(Car), useValue: stub() },
      { provide: getRepositoryToken(Trailer), useValue: stub() },
    ],
  },
  {
    path: '/api/physical-attachments',
    controllers: [PhysicalAttachmentController],
    providers: [
      { provide: PhysicalAttachmentService, useValue: { findAndCount: emptyFindAndCount() } },
      { provide: getRepositoryToken(Car), useValue: stub() },
      { provide: getRepositoryToken(Trailer), useValue: stub() },
    ],
  },
  {
    path: '/api/drivers',
    controllers: [DriverController],
    providers: [
      { provide: DriverService, useValue: { findAndCount: emptyFindAndCount() } },
      { provide: UserService, useValue: stub() },
      { provide: ContactService, useValue: stub() },
      { provide: AccountService, useValue: stub() },
      { provide: DataSource, useValue: stub() },
    ],
  },
  {
    path: '/api/users',
    controllers: [UserController],
    providers: [
      { provide: UserService, useValue: { findAndCount: emptyFindAndCount() } },
      { provide: ContactService, useValue: stub() },
      { provide: AccountService, useValue: stub() },
      { provide: DataSource, useValue: stub() },
    ],
  },
  {
    path: '/api/owners',
    controllers: [OwnerController],
    providers: [
      { provide: OwnerService, useValue: { findAndCount: emptyFindAndCount() } },
      { provide: RelCarOwnerService, useValue: stub() },
      { provide: RelTrailerOwnerService, useValue: stub() },
      { provide: CarService, useValue: stub() },
      { provide: TrailerService, useValue: stub() },
      { provide: DataSource, useValue: stub() },
    ],
  },
  {
    path: '/api/employees',
    controllers: [EmployeeController],
    providers: [
      { provide: EmployeeService, useValue: { findAndCount: emptyFindAndCount() } },
      { provide: UserService, useValue: stub() },
      { provide: BranchService, useValue: stub() },
      { provide: AccountService, useValue: stub() },
      { provide: ContactService, useValue: stub() },
      { provide: SalaryService, useValue: stub() },
      { provide: CustodyService, useValue: stub() },
      { provide: DataSource, useValue: stub() },
    ],
  },
  {
    path: '/api/custodies',
    controllers: [CustodyController],
    providers: [
      { provide: CustodyService, useValue: { findAndCount: emptyFindAndCount() } },
      { provide: EmployeeService, useValue: stub() },
      {
        provide: AccountService,
        useValue: { getCurrentBalancesForAccounts: jest.fn().mockResolvedValue(new Map()) },
      },
      { provide: JourneyService, useValue: stub() },
      { provide: DriverService, useValue: stub() },
    ],
  },
  {
    path: '/api/journeys',
    controllers: [JourneyController],
    providers: [
      { provide: JourneyService, useValue: { findAndCount: emptyFindAndCount() } },
      { provide: JourneyAssetsService, useValue: stub() },
      { provide: DriverService, useValue: stub() },
      { provide: UserService, useValue: stub() },
      { provide: CarService, useValue: stub() },
      { provide: TrailerService, useValue: stub() },
      { provide: JourneyTransactionService, useValue: stub() },
      { provide: ClientService, useValue: stub() },
      { provide: EmployeeService, useValue: stub() },
      { provide: AccountService, useValue: stub() },
      { provide: CustodyService, useValue: stub() },
      { provide: DataSource, useValue: stub() },
      { provide: JourneyDelegationPrintService, useValue: stub() },
      { provide: JourneyRevenueService, useValue: stub() },
    ],
  },
  {
    path: '/api/office-requests',
    controllers: [OfficeRequestController],
    providers: [
      { provide: OfficeRequestService, useValue: { findAndCount: emptyFindAndCount() } },
      { provide: JourneyService, useValue: stub() },
      { provide: EmployeeService, useValue: stub() },
      { provide: AccountService, useValue: stub() },
      { provide: CustodyService, useValue: stub() },
      { provide: DataSource, useValue: stub() },
      { provide: JourneyDelegationPrintService, useValue: stub() },
    ],
  },
];

describe('List get-all smoke', () => {
  it.each(cases)('$path returns non-5xx', async ({ path, controllers, providers }) => {
    const moduleRef = await Test.createTestingModule({
      controllers,
      providers,
    })
      .overrideGuard(AuthGuard)
      .useValue(authGuardMock)
      .overrideGuard(RolesGuard)
      .useValue(rolesGuardMock)
      .compile();

    const app = moduleRef.createNestApplication();
    await app.init();

    try {
      const res = await request(app.getHttpServer()).get(`${path}?page=1&pageSize=1`);
      expect(res.status).toBeLessThan(500);
      expect(res.status).not.toBe(404);
    } finally {
      await app.close();
    }
  });

  it('GET /api/grids/by-page-key/trips returns 200 with empty columns when missing', async () => {
    const gridsService = {
      findByFields: jest.fn().mockResolvedValue(undefined),
      findAndCount: emptyFindAndCount(),
      save: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [GridsController],
      providers: [{ provide: GridsService, useValue: gridsService }],
    })
      .overrideGuard(AuthGuard)
      .useValue(authGuardMock)
      .overrideGuard(RolesGuard)
      .useValue(rolesGuardMock)
      .compile();

    const app = moduleRef.createNestApplication();
    await app.init();

    try {
      const res = await request(app.getHttpServer()).get('/api/grids/by-page-key/trips');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ pageKey: 'trips', columns: [] });
    } finally {
      await app.close();
    }
  });
});
