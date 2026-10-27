import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { JourneyVehicleMode } from 'src/core/enums/journey-vehicle-mode';
import { UserRole } from 'src/core/enums/user-role';
import { VeachleStatus } from 'src/core/enums/veachle-status';
import { GeneratorTypes } from 'src/core/enums/generator-types';
import { generateUniqueCode, generateUniqueUsername } from 'src/core/utils/generator';
import { CreateJourneyDTO } from './dtos/create-journey.dto';
import { UpdateJourneyDTO } from './dtos/update-journey.dto';
import {
  JourneyCarAssignmentDTO,
  JourneyDriverAssignmentDTO,
  JourneyTrailerAssignmentDTO,
} from './dtos/journey-asset-assignment.dto';
import { NolonInlineCarDTO } from './dtos/nolon-inline-car.dto';
import { NolonInlineDriverDTO } from './dtos/nolon-inline-driver.dto';
import { NolonInlineTrailerDTO } from './dtos/nolon-inline-trailer.dto';
import {
  mapNolonInlineCarToCreate,
  mapNolonInlineDriverToCreate,
  mapNolonInlineTrailerToCreate,
  normalizeJourneyAssetAssignment,
} from './journey-nolon-inline.util';
import { Contact } from '../contact/contact.entity';
import { Driver } from '../driver/driver.entity';
import { Car } from '../car/car.entity';
import { Trailer } from '../trailer/trailer.entity';
import { User } from '../user/user.entity';
import { mapCreateDriverDtoToEntity } from '../driver/driver.mapper';
import { mapCreateCarDtoToEntity } from '../car/car.mapper';
import { mapCreateTrailerDtoToEntity } from '../trailer/trailer.mapper';
import { CreateDriverDTO } from '../driver/dtos/create-driver.dto';
import { CreateCarDTO } from '../car/dtos/create-car.dto';
import { CreateTrailerDTO } from '../trailer/dtos/create-trailer.dto';
import {
  assertInlineCreateAllowed,
  expectedOwnerShipForMode,
  validateCarForMode,
  validateTrailerForMode,
} from './journey-vehicle-mode.util';
import { UserService } from '../user/user.service';
import { AccountService } from '../account/account.service';
import {
  buildPersonAccountName,
  PERSON_ACCOUNT_PARENTS,
} from '../account/person-account.constants';

export interface ResolvedJourneyAssetIds {
  driverId: number;
  carId: number;
  trailerId: number;
}

@Injectable()
export class JourneyAssetsService {
  constructor(
    private readonly userService: UserService,
    private readonly accountService: AccountService,
  ) {}

  /**
   * Resolves driver/car/trailer from ids, nested assignment objects, or inline create payloads.
   * Mutates dto with resolved ids for downstream mapping.
   */
  async resolveForCreate(
    dto: CreateJourneyDTO,
    manager: EntityManager,
    creator?: string,
  ): Promise<ResolvedJourneyAssetIds> {
    if (!dto.vehicleMode) {
      throw new BadRequestException('vehicleMode is required');
    }

    this.assertNoConflictingAssetInputs(dto);

    const driverId = await this.resolveDriver(
      dto.vehicleMode,
      dto.driverId,
      dto.driver,
      manager,
      creator,
      true,
    );
    const carId = await this.resolveCar(
      dto.vehicleMode,
      dto.carId,
      dto.car,
      manager,
      creator,
      true,
    );
    const trailerId = await this.resolveTrailer(
      dto.vehicleMode,
      dto.trailerId,
      dto.trailer,
      manager,
      creator,
      true,
    );

    dto.driverId = driverId;
    dto.carId = carId;
    dto.trailerId = trailerId;

    return { driverId, carId, trailerId };
  }

  /** Resolves only assets present on the update DTO. */
  async resolveForUpdate(
    dto: UpdateJourneyDTO,
    manager: EntityManager,
    creator?: string,
  ): Promise<Partial<ResolvedJourneyAssetIds>> {
    const resolved: Partial<ResolvedJourneyAssetIds> = {};
    const mode = dto.vehicleMode;

    if (this.hasDriverInput(dto)) {
      if (!mode) {
        throw new BadRequestException('vehicleMode is required when updating driver assignment');
      }
      resolved.driverId = await this.resolveDriver(
        mode,
        dto.driverId,
        dto.driver,
        manager,
        creator,
        false,
      );
      dto.driverId = resolved.driverId;
    }

    if (this.hasCarInput(dto)) {
      if (!mode) {
        throw new BadRequestException('vehicleMode is required when updating car assignment');
      }
      resolved.carId = await this.resolveCar(mode, dto.carId, dto.car, manager, creator, false);
      dto.carId = resolved.carId;
    }

    if (this.hasTrailerInput(dto)) {
      if (!mode) {
        throw new BadRequestException('vehicleMode is required when updating trailer assignment');
      }
      resolved.trailerId = await this.resolveTrailer(
        mode,
        dto.trailerId,
        dto.trailer,
        manager,
        creator,
        false,
      );
      dto.trailerId = resolved.trailerId;
    }

    return resolved;
  }

  private hasDriverInput(dto: UpdateJourneyDTO): boolean {
    return dto.driverId !== undefined || dto.driver?.id !== undefined || !!dto.driver?.create;
  }

  private hasCarInput(dto: UpdateJourneyDTO): boolean {
    return dto.carId !== undefined || dto.car?.id !== undefined || !!dto.car?.create;
  }

  private hasTrailerInput(dto: UpdateJourneyDTO): boolean {
    return dto.trailerId !== undefined || dto.trailer?.id !== undefined || !!dto.trailer?.create;
  }

  private assertNoConflictingAssetInputs(dto: CreateJourneyDTO): void {
    if (dto.driverId != null && normalizeJourneyAssetAssignment(dto.driver)?.create != null) {
      throw new BadRequestException('Provide either driverId or inline driver fields, not both');
    }
    if (dto.carId != null && normalizeJourneyAssetAssignment(dto.car)?.create != null) {
      throw new BadRequestException('Provide either carId or inline car fields, not both');
    }
    if (dto.trailerId != null && normalizeJourneyAssetAssignment(dto.trailer)?.create != null) {
      throw new BadRequestException('Provide either trailerId or inline trailer fields, not both');
    }
  }

  private resolveAssetAssignment(
    flatId: number | undefined,
    assignment: { id?: number; create?: unknown } | undefined,
  ) {
    const normalized = normalizeJourneyAssetAssignment(assignment);

    if (flatId != null && normalized?.create != null) {
      throw new BadRequestException(
        'Provide either flat asset id or inline asset fields, not both',
      );
    }

    if (normalized?.id != null) {
      return normalized;
    }

    if (normalized?.create != null) {
      return normalized;
    }

    return flatId != null ? { id: flatId } : undefined;
  }

  private async resolveDriver(
    mode: JourneyVehicleMode,
    flatId: number | undefined,
    assignment: JourneyDriverAssignmentDTO | undefined,
    manager: EntityManager,
    creator: string | undefined,
    required: boolean,
  ): Promise<number> {
    const resolved = this.resolveAssetAssignment(flatId, assignment);

    if (!resolved) {
      if (required) {
        throw new BadRequestException('driver id or inline driver payload is required');
      }
      throw new BadRequestException('driver assignment is required');
    }

    if (resolved.id != null && resolved.create != null) {
      throw new BadRequestException('Provide either driver id or inline driver fields, not both');
    }

    if (resolved.id != null) {
      const driver = await manager.findOne(Driver, {
        where: { id: resolved.id },
        relations: ['user'],
      });
      if (!driver) throw new NotFoundException(`Driver with id ${resolved.id} not found`);
      return driver.id;
    }

    if (resolved.create) {
      assertInlineCreateAllowed(mode, 'driver');
      const createDto = mapNolonInlineDriverToCreate(
        resolved.create as unknown as NolonInlineDriverDTO,
      );
      return await this.createDriverInline(createDto, manager, creator);
    }

    if (required) {
      throw new BadRequestException('driver id or inline driver payload is required');
    }

    throw new BadRequestException('driver assignment is required');
  }

  private async resolveCar(
    mode: JourneyVehicleMode,
    flatId: number | undefined,
    assignment: JourneyCarAssignmentDTO | undefined,
    manager: EntityManager,
    creator: string | undefined,
    required: boolean,
  ): Promise<number> {
    const resolved = this.resolveAssetAssignment(flatId, assignment);

    if (!resolved) {
      if (required) {
        throw new BadRequestException('car id or inline car payload is required');
      }
      throw new BadRequestException('car assignment is required');
    }

    if (resolved.id != null && resolved.create != null) {
      throw new BadRequestException('Provide either car id or inline car fields, not both');
    }

    if (resolved.id != null) {
      const car = await manager.findOne(Car, { where: { id: resolved.id } });
      if (!car) throw new NotFoundException(`Car with id ${resolved.id} not found`);
      validateCarForMode(car, mode);
      return car.id;
    }

    if (resolved.create) {
      assertInlineCreateAllowed(mode, 'car');
      const createDto = mapNolonInlineCarToCreate(resolved.create as unknown as NolonInlineCarDTO);
      return await this.createCarInline(createDto, mode, manager, creator);
    }

    if (required) {
      throw new BadRequestException('car id or inline car payload is required');
    }

    throw new BadRequestException('car assignment is required');
  }

  private async resolveTrailer(
    mode: JourneyVehicleMode,
    flatId: number | undefined,
    assignment: JourneyTrailerAssignmentDTO | undefined,
    manager: EntityManager,
    creator: string | undefined,
    required: boolean,
  ): Promise<number> {
    const resolved = this.resolveAssetAssignment(flatId, assignment);

    if (!resolved) {
      if (required) {
        throw new BadRequestException('trailer id or inline trailer payload is required');
      }
      throw new BadRequestException('trailer assignment is required');
    }

    if (resolved.id != null && resolved.create != null) {
      throw new BadRequestException('Provide either trailer id or inline trailer fields, not both');
    }

    if (resolved.id != null) {
      const trailer = await manager.findOne(Trailer, { where: { id: resolved.id } });
      if (!trailer) throw new NotFoundException(`Trailer with id ${resolved.id} not found`);
      validateTrailerForMode(trailer, mode);
      return trailer.id;
    }

    if (resolved.create) {
      assertInlineCreateAllowed(mode, 'trailer');
      const createDto = mapNolonInlineTrailerToCreate(
        resolved.create as unknown as NolonInlineTrailerDTO,
      );
      return await this.createTrailerInline(createDto, mode, manager, creator);
    }

    if (required) {
      throw new BadRequestException('trailer id or inline trailer payload is required');
    }

    throw new BadRequestException('trailer assignment is required');
  }

  private async createDriverInline(
    dto: CreateDriverDTO,
    manager: EntityManager,
    creator?: string,
  ): Promise<number> {
    const existing = await manager.findOne(Driver, { where: { licenseNumber: dto.licenseNumber } });
    if (existing) {
      throw new BadRequestException(
        `Driver with license number ${dto.licenseNumber} already exists`,
      );
    }

    if (dto.user?.email) {
      const emailCheck = await this.userService.findByFields({
        where: { email: dto.user.email },
      });
      if (emailCheck) {
        throw new BadRequestException(`User with email ${dto.user.email} already exists`);
      }
    }

    const driver = await mapCreateDriverDtoToEntity(dto);
    if (!driver.user) {
      throw new BadRequestException('driver.user is required when creating a driver inline');
    }
    if (!driver.user.role) {
      driver.user.role = UserRole.DRIVER;
    }

    const userRepo = manager.getRepository(User);
    if (!driver.user.code) {
      driver.user.code = await generateUniqueCode(userRepo, driver.user.role);
    }
    if (driver.user.role === UserRole.DRIVER) {
      driver.user.username = await generateUniqueUsername(userRepo, UserRole.DRIVER);
    }

    const now = new Date();
    driver.createdAt = driver.createdAt ?? now;
    driver.updatedAt = now;
    if (creator) {
      driver.createdBy = driver.createdBy ?? creator;
      driver.updatedBy = creator;
      driver.user.createdBy = driver.user.createdBy ?? creator;
      driver.user.updatedBy = creator;
      driver.user.createdAt = driver.createdAt;
    }

    const saved = await manager.save(Driver, driver);

    if (dto.contacts?.length) {
      for (const c of dto.contacts) {
        const contact = new Contact();
        contact.phone = c.phone;
        contact.isPrimary = c.isPrimary ?? true;
        contact.user = saved.user;
        if (creator) {
          contact.createdBy = creator;
          contact.updatedBy = creator;
        }
        await manager.save(Contact, contact);
      }
    }

    const personName = buildPersonAccountName(
      saved.user?.firstName,
      saved.user?.lastName,
      `Driver ${saved.id}`,
    );
    await this.accountService.createPersonSubAccounts(
      personName,
      PERSON_ACCOUNT_PARENTS[UserRole.DRIVER]!,
      creator,
      manager,
    );

    return saved.id;
  }

  private async createCarInline(
    dto: CreateCarDTO,
    mode: JourneyVehicleMode,
    manager: EntityManager,
    creator?: string,
  ): Promise<number> {
    const car = mapCreateCarDtoToEntity(dto);
    car.ownerShip = expectedOwnerShipForMode(mode);

    const carRepo = manager.getRepository(Car);
    car.code = await generateUniqueCode(carRepo, GeneratorTypes.CAR);

    const now = new Date();
    car.createdAt = car.createdAt ?? now;
    car.updatedAt = now;
    if (creator) {
      car.createdBy = car.createdBy ?? creator;
      car.updatedBy = creator;
    }

    const saved = await manager.save(Car, car);
    return saved.id;
  }

  private async createTrailerInline(
    dto: CreateTrailerDTO,
    mode: JourneyVehicleMode,
    manager: EntityManager,
    creator?: string,
  ): Promise<number> {
    const trailer = mapCreateTrailerDtoToEntity(dto);
    trailer.ownerShip = expectedOwnerShipForMode(mode);
    trailer.status = trailer.status ?? VeachleStatus.AVILABLE;

    const trailerRepo = manager.getRepository(Trailer);
    trailer.code = await generateUniqueCode(trailerRepo, GeneratorTypes.TRAILER);

    const now = new Date();
    trailer.createdAt = trailer.createdAt ?? now;
    trailer.updatedAt = now;
    if (creator) {
      trailer.createdBy = trailer.createdBy ?? creator;
      trailer.updatedBy = creator;
    }

    const saved = await manager.save(Trailer, trailer);
    return saved.id;
  }
}
