import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { JourneyAssetsService } from './journey-assets.service';
import { CreateJourneyDTO } from './dtos/create-journey.dto';
import { JourneyVehicleMode } from 'src/core/enums/journey-vehicle-mode';
import { OwnerShipType } from 'src/core/enums/ownerShip-types';
import { VeachleStatus } from 'src/core/enums/veachle-status';
import { Driver } from '../driver/driver.entity';
import { Car } from '../car/car.entity';
import { Trailer } from '../trailer/trailer.entity';
import { Contact } from '../contact/contact.entity';
import { UserService } from '../user/user.service';
import { AccountService } from '../account/account.service';
import { PERSON_ACCOUNT_PARENTS } from '../account/person-account.constants';
import { UserRole } from 'src/core/enums/user-role';
import { PackingType } from 'src/core/enums/packing-type';

describe('JourneyAssetsService.resolveForCreate', () => {
  let service: JourneyAssetsService;
  let manager: {
    findOne: jest.Mock;
    save: jest.Mock;
    getRepository: jest.Mock;
  };
  let userService: { findByFields: jest.Mock };
  let accountService: { createPersonSubAccounts: jest.Mock };

  const driver = { id: 1, user: { id: 10 } } as Driver;

  function car(id: number, ownerShip: OwnerShipType, status = VeachleStatus.AVILABLE) {
    return { id, ownerShip, status } as Car;
  }

  function trailer(id: number, ownerShip: OwnerShipType, status = VeachleStatus.AVILABLE) {
    return { id, ownerShip, status } as Trailer;
  }

  function baseDto(overrides: Partial<CreateJourneyDTO> = {}): CreateJourneyDTO {
    return {
      vehicleMode: JourneyVehicleMode.COMPANY_CAR,
      clientId: 1,
      direction: 'Cairo',
      packingType: PackingType.BAGGED,
      quantity: 80,
      driverId: 1,
      carId: 2,
      trailerId: 3,
      ...overrides,
    } as CreateJourneyDTO;
  }

  beforeEach(() => {
    userService = { findByFields: jest.fn().mockResolvedValue(null) };
    accountService = { createPersonSubAccounts: jest.fn().mockResolvedValue([]) };
    manager = {
      findOne: jest.fn(),
      save: jest.fn().mockImplementation(async (_entity, payload) => ({
        id: 99,
        ...payload,
      })),
      getRepository: jest.fn().mockReturnValue({
        createQueryBuilder: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(null),
        }),
      }),
    };

    service = new JourneyAssetsService(
      userService as unknown as UserService,
      accountService as unknown as AccountService,
    );

    jest
      .spyOn(require('src/core/utils/generator'), 'generateUniqueCode')
      .mockResolvedValue('GEN-001');
    jest
      .spyOn(require('src/core/utils/generator'), 'generateUniqueUsername')
      .mockResolvedValue('driver_user_1');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function mockFindOneForFlatIds(
    mode: JourneyVehicleMode,
    carId: number,
    trailerId: number,
  ) {
    const expected = {
      [JourneyVehicleMode.COMPANY_CAR]: OwnerShipType.COMPANY_CAR,
      [JourneyVehicleMode.CONTRACT_CAR]: OwnerShipType.CONTRACT_CAR,
      [JourneyVehicleMode.NOLON_CAR]: OwnerShipType.NOLON_CAR,
    }[mode];

    manager.findOne.mockImplementation(async (entity: unknown, opts: { where: { id: number } }) => {
      if (entity === Driver) return driver;
      if (entity === Car) return car(carId, expected);
      if (entity === Trailer) return trailer(trailerId, expected);
      return null;
    });
  }

  describe('COMPANY_CAR', () => {
    it('resolves flat driverId, carId, trailerId', async () => {
      mockFindOneForFlatIds(JourneyVehicleMode.COMPANY_CAR, 2, 3);
      const dto = baseDto({ vehicleMode: JourneyVehicleMode.COMPANY_CAR });

      const result = await service.resolveForCreate(
        dto,
        manager as unknown as EntityManager,
        'test@example.com',
      );

      expect(result).toEqual({ driverId: 1, carId: 2, trailerId: 3 });
      expect(dto.driverId).toBe(1);
      expect(dto.carId).toBe(2);
      expect(dto.trailerId).toBe(3);
    });

    it('rejects car with wrong ownerShip', async () => {
      manager.findOne.mockImplementation(async (entity: unknown) => {
        if (entity === Driver) return driver;
        if (entity === Car) return car(2, OwnerShipType.CONTRACT_CAR);
        if (entity === Trailer) return trailer(3, OwnerShipType.COMPANY_CAR);
        return null;
      });

      await expect(
        service.resolveForCreate(
          baseDto({ vehicleMode: JourneyVehicleMode.COMPANY_CAR }),
          manager as unknown as EntityManager,
        ),
      ).rejects.toThrow(/Car ownerShip must be COMPANY_CAR/);
    });

    it('rejects inline car.create', async () => {
      manager.findOne.mockImplementation(async (entity: unknown) => {
        if (entity === Driver) return driver;
        return null;
      });

      await expect(
        service.resolveForCreate(
          baseDto({
            vehicleMode: JourneyVehicleMode.COMPANY_CAR,
            carId: undefined,
            car: { create: { manufacturer: 'X' } as never },
          }),
          manager as unknown as EntityManager,
        ),
      ).rejects.toThrow(/Inline car creation is only allowed for NOLON_CAR/);
    });
  });

  describe('CONTRACT_CAR', () => {
    it('resolves flat ids when assets are CONTRACT_CAR', async () => {
      mockFindOneForFlatIds(JourneyVehicleMode.CONTRACT_CAR, 2, 2);
      const dto = baseDto({
        vehicleMode: JourneyVehicleMode.CONTRACT_CAR,
        trailerId: 2,
      });

      const result = await service.resolveForCreate(dto, manager as unknown as EntityManager);

      expect(result).toEqual({ driverId: 1, carId: 2, trailerId: 2 });
    });

    it('rejects car with COMPANY_CAR ownerShip', async () => {
      manager.findOne.mockImplementation(async (entity: unknown) => {
        if (entity === Driver) return driver;
        if (entity === Car) return car(2, OwnerShipType.COMPANY_CAR);
        if (entity === Trailer) return trailer(2, OwnerShipType.CONTRACT_CAR);
        return null;
      });

      await expect(
        service.resolveForCreate(
          baseDto({ vehicleMode: JourneyVehicleMode.CONTRACT_CAR, trailerId: 2 }),
          manager as unknown as EntityManager,
        ),
      ).rejects.toThrow(/Car ownerShip must be CONTRACT_CAR/);
    });
  });

  describe('NOLON_CAR', () => {
    it('resolves flat ids when assets are NOLON_CAR', async () => {
      mockFindOneForFlatIds(JourneyVehicleMode.NOLON_CAR, 3, 1);
      const dto = baseDto({
        vehicleMode: JourneyVehicleMode.NOLON_CAR,
        carId: 3,
        trailerId: 1,
      });

      const result = await service.resolveForCreate(dto, manager as unknown as EntityManager);
      expect(result).toEqual({ driverId: 1, carId: 3, trailerId: 1 });
    });

    it('resolves nested driver.id / car.id / trailer.id', async () => {
      mockFindOneForFlatIds(JourneyVehicleMode.NOLON_CAR, 3, 1);
      const dto = baseDto({
        vehicleMode: JourneyVehicleMode.NOLON_CAR,
        driverId: undefined,
        carId: undefined,
        trailerId: undefined,
        driver: { id: 1 },
        car: { id: 3 },
        trailer: { id: 1 },
      });

      const result = await service.resolveForCreate(dto, manager as unknown as EntityManager);
      expect(result).toEqual({ driverId: 1, carId: 3, trailerId: 1 });
    });

    it('rejects both carId and inline car fields', async () => {
      await expect(
        service.resolveForCreate(
          baseDto({
            vehicleMode: JourneyVehicleMode.NOLON_CAR,
            carId: 2,
            car: { plateNumber: '1', plateLetters: 'A' } as never,
            trailerId: 1,
          }),
          manager as unknown as EntityManager,
        ),
      ).rejects.toThrow(/carId or inline car fields/);
    });

    it('resolves unwrapped inline driver/car/trailer', async () => {
      manager.findOne.mockImplementation(
        async (entity: unknown, opts?: { where?: Record<string, unknown> }) => {
          if (entity === Driver) {
            if (opts?.where && 'licenseNumber' in opts.where) return null;
            return driver;
          }
          return null;
        },
      );
      manager.save.mockImplementation(async (entityOrPayload: unknown, maybePayload?: unknown) => {
        const payload = (maybePayload ?? entityOrPayload) as Record<string, unknown>;
        if (entityOrPayload === Driver) {
          return { id: 50, user: { id: 500, firstName: 'Nolon', lastName: 'Driver' } };
        }
        if (entityOrPayload === Contact) return { id: 301, ...payload, id: 301 };
        if (payload?.plateNumber === '9901') return { ...payload, id: 51 };
        if (payload?.plateNumber === '9902') return { ...payload, id: 52 };
        return { ...payload, id: 99 };
      });

      const dto = baseDto({
        vehicleMode: JourneyVehicleMode.NOLON_CAR,
        driverId: undefined,
        carId: undefined,
        trailerId: undefined,
        driver: {
          user: {
            firstName: 'Nolon',
            lastName: 'Driver',
            nationalId: 2,
            phoneNumber: '51515',
          },
        } as never,
        car: {
          plateNumber: '9901',
          plateLetters: 'ن ل ن',
        } as never,
        trailer: {
          plateNumber: '9902',
          plateLetters: 'م ق ط',
        } as never,
      });

      const result = await service.resolveForCreate(dto, manager as unknown as EntityManager);
      expect(result.driverId).toBe(50);
      expect(result.carId).toBe(51);
      expect(result.trailerId).toBe(52);
      expect(accountService.createPersonSubAccounts).toHaveBeenCalledWith(
        'Nolon Driver',
        PERSON_ACCOUNT_PARENTS[UserRole.DRIVER],
        undefined,
        manager,
      );
    });

    it('allows ONROAD car on another journey', async () => {
      manager.findOne.mockImplementation(async (entity: unknown, opts: { where: { id: number } }) => {
        if (entity === Driver) return driver;
        if (entity === Car) return car(3, OwnerShipType.NOLON_CAR, VeachleStatus.ONROAD);
        if (entity === Trailer) return trailer(1, OwnerShipType.NOLON_CAR);
        return null;
      });

      const result = await service.resolveForCreate(
        baseDto({
          vehicleMode: JourneyVehicleMode.NOLON_CAR,
          carId: 3,
          trailerId: 1,
        }),
        manager as unknown as EntityManager,
      );
      expect(result.carId).toBe(3);
    });

    it('rejects UNAVAILABLE car', async () => {
      manager.findOne.mockImplementation(async (entity: unknown, opts: { where: { id: number } }) => {
        if (entity === Driver) return driver;
        if (entity === Car) return car(3, OwnerShipType.NOLON_CAR, VeachleStatus.UNAVILABLE);
        if (entity === Trailer) return trailer(1, OwnerShipType.NOLON_CAR);
        return null;
      });

      await expect(
        service.resolveForCreate(
          baseDto({
            vehicleMode: JourneyVehicleMode.NOLON_CAR,
            carId: 3,
            trailerId: 1,
          }),
          manager as unknown as EntityManager,
        ),
      ).rejects.toThrow(/Car with id 3 is not available/);
    });
  });

  describe('shared errors', () => {
    it('requires vehicleMode', async () => {
      const dto = baseDto();
      delete (dto as Partial<CreateJourneyDTO>).vehicleMode;

      await expect(
        service.resolveForCreate(dto, manager as unknown as EntityManager),
      ).rejects.toThrow(/vehicleMode is required/);
    });

    it('requires driver assignment', async () => {
      await expect(
        service.resolveForCreate(
          baseDto({ driverId: undefined }),
          manager as unknown as EntityManager,
        ),
      ).rejects.toThrow(/driver id or inline driver payload is required/);
    });

    it('throws when driver not found', async () => {
      manager.findOne.mockResolvedValue(null);

      await expect(
        service.resolveForCreate(baseDto(), manager as unknown as EntityManager),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws when car not found', async () => {
      manager.findOne.mockImplementation(async (entity: unknown) => {
        if (entity === Driver) return driver;
        return null;
      });

      await expect(
        service.resolveForCreate(baseDto(), manager as unknown as EntityManager),
      ).rejects.toThrow(/Car with id 2 not found/);
    });
  });
});
