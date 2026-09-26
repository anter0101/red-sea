import { UserRole } from 'src/core/enums/user-role';
import { UserStatus } from 'src/core/enums/user-status';
import { OwnerShipType } from 'src/core/enums/ownerShip-types';
import { CreateDriverDTO } from '../driver/dtos/create-driver.dto';
import { CreateCarDTO } from '../car/dtos/create-car.dto';
import { CreateTrailerDTO } from '../trailer/dtos/create-trailer.dto';
import { CreateUserDTO } from '../user/dtos/create-user.dto';
import { NolonInlineDriverDTO } from './dtos/nolon-inline-driver.dto';
import { NolonInlineCarDTO } from './dtos/nolon-inline-car.dto';
import { NolonInlineTrailerDTO } from './dtos/nolon-inline-trailer.dto';
import { NolonInlineUserDTO } from './dtos/nolon-inline-user.dto';

export interface NormalizedAssetAssignment {
  id?: number;
  create?: Record<string, unknown>;
}

/** Select: `{ id }`. Inline: fields directly or legacy `{ create: { ... } }`. */
export function normalizeJourneyAssetAssignment(
  value: unknown,
): NormalizedAssetAssignment | undefined {
  if (value == null || typeof value !== 'object') return undefined;

  const o = value as Record<string, unknown>;

  if (o.create != null && typeof o.create === 'object') {
    const inner = o.create as Record<string, unknown>;
    if (inner.id != null && inner.id !== '' && Object.keys(inner).length === 1) {
      return { id: Number(inner.id) };
    }
    return { create: inner };
  }

  if (o.id != null && o.id !== '') {
    const otherKeys = Object.keys(o).filter((k) => k !== 'id');
    if (otherKeys.length === 0) {
      return { id: Number(o.id) };
    }
  }

  const { id: _stripId, create: _stripCreate, ...rest } = o;
  if (Object.keys(rest).length === 0) return undefined;

  return { create: rest };
}

export function mapNolonUserToCreateUser(user: NolonInlineUserDTO): CreateUserDTO {
  const { nationalId, phoneNumber, ...rest } = user;
  const mapped: CreateUserDTO = {
    ...rest,
    role: UserRole.DRIVER,
    status: UserStatus.AVAILABLE,
  } as CreateUserDTO;

  if (nationalId != null && nationalId !== '') {
    mapped.personalId = String(nationalId);
  }

  if (phoneNumber) {
    mapped.contacts = [{ phone: phoneNumber, isPrimary: true }];
  }

  return mapped;
}

export function mapNolonInlineDriverToCreate(dto: NolonInlineDriverDTO): CreateDriverDTO {
  const userWithContacts = mapNolonUserToCreateUser(dto.user);
  const { contacts, ...user } = userWithContacts;

  return {
    licenseNumber: dto.licenseNumber ?? `NOLON-${uniqueSuffix()}`,
    licenseExpiryDate: (dto.licenseExpiryDate ?? '2030-12-31') as unknown as Date,
    user,
    contacts,
  } as CreateDriverDTO;
}

function uniqueSuffix(): string {
  return `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

export function mapNolonInlineCarToCreate(dto: NolonInlineCarDTO): CreateCarDTO {
  const result: CreateCarDTO = {
    ownerShip: OwnerShipType.NOLON_CAR,
    plateNumber: dto.plateNumber,
    plateLetters: dto.plateLetters,
    licenseNumber: dto.licenseNumber,
    licenseExpiryDate: dto.licenseExpiryDate as unknown as Date,
  };

  if (dto.manufacturer !== undefined) result.manufacturer = dto.manufacturer;
  if (dto.model !== undefined) result.model = dto.model;
  if (dto.status !== undefined) result.status = dto.status;
  if (dto.manufactureYear !== undefined) result.manufactureYear = dto.manufactureYear;
  if (dto.color !== undefined) result.color = dto.color;
  if (dto.chassisNumber !== undefined) result.chassisNumber = dto.chassisNumber;

  return result;
}

export function mapNolonInlineTrailerToCreate(dto: NolonInlineTrailerDTO): CreateTrailerDTO {
  const result: CreateTrailerDTO = {
    ownerShip: OwnerShipType.NOLON_CAR,
    plateNumber: dto.plateNumber,
    plateLetters: dto.plateLetters,
    licenseNumber: dto.licenseNumber,
    licenseExpiryDate: dto.licenseExpiryDate as unknown as Date,
  };

  if (dto.manufacturer !== undefined) result.manufacturer = dto.manufacturer;
  if (dto.status !== undefined) result.status = dto.status;
  if (dto.maxWeight !== undefined) result.maxWeight = dto.maxWeight;
  if (dto.chassisNumber !== undefined) result.chassisNumber = dto.chassisNumber;
  if (dto.chaseType !== undefined) result.chaseType = dto.chaseType;
  if (dto.manufactureYear !== undefined) result.manufactureYear = dto.manufactureYear;
  if (dto.color !== undefined) result.color = dto.color;

  return result;
}

