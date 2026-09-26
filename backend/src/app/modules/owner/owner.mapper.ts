// src/owner/owner.mapper.ts
import { Owner } from './owner.entity';
import { OwnerDTO } from './dtos/owner.dto';
import { CreateOwnerDTO } from './dtos/create-owner.dto';
import { UpdateOwnerDTO } from './dtos/update-owner.dto';
import { BaseDTO } from 'src/core/utils/base.dto';
import { Car } from '../car/car.entity';
import { Trailer } from '../trailer/trailer.entity';

import { RelCarOwner } from '../rel-car-owner/rel-car-owner.entity';
import { RelTrailerOwner } from '../rel-trailer-owner/rel-trailer-owner.entity';
import { mapCarToCarDtoSelective } from '../car/car.mapper';
import { mapTrailerToTrailerDtoSelective } from '../trailer/trailer.mapper';

const allowedOwnerDtoKeys: ReadonlyArray<keyof OwnerDTO | keyof BaseDTO> = [
  'id',
  'name',
  'phone',
  'address',
  'email',
  'bankAccountNumber',
  'bankName',
  'transactionType',
  'trailerOwnerships',
  'carOwnerships',
  'trailerOwnerships',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
] as const;

/**
 * Maps Owner entity to OwnerDTO selectively
 * Supports nested car/trailer in ownerships
 */
export function mapOwnerToOwnerDtoSelective(
  owner: Owner,
  keys?: (keyof OwnerDTO | keyof BaseDTO)[],
): Partial<OwnerDTO>;
export function mapOwnerToOwnerDtoSelective(
  owners: Owner[],
  keys?: (keyof OwnerDTO | keyof BaseDTO)[],
): Partial<OwnerDTO>[];
export function mapOwnerToOwnerDtoSelective(
  ownerOrOwners: Owner | Owner[],
  keys = allowedOwnerDtoKeys,
): Partial<OwnerDTO> | Partial<OwnerDTO>[] {
  const mapSingle = (owner: Owner): Partial<OwnerDTO> => {
    const dto: Partial<OwnerDTO> = {};

    const keysToMap = keys.filter((k) => allowedOwnerDtoKeys.includes(k as any));

    keysToMap.forEach((key) => {
      if (key === 'carOwnerships' && owner.carOwnerships && owner.carOwnerships.length > 0) {
        dto.carOwnerships = owner.carOwnerships.map((rel) => ({
          id: rel.id,
          percentage: rel.percentage,
          contractUrl: rel.contractUrl,
          notes: rel.notes,
          car: mapCarToCarDtoSelective(rel.car, [
            'id',
            'code',
            'manufactureYear',
            'manufacturer',
            'model',
            'plateNumber',
          ]) as any,
        }));
      } else if (
        key === 'trailerOwnerships' &&
        owner.trailerOwnerships &&
        owner.trailerOwnerships.length > 0
      ) {
        dto.trailerOwnerships = owner.trailerOwnerships.map((rel) => ({
          id: rel.id,
          percentage: rel.percentage,
          contractUrl: rel.contractUrl,
          notes: rel.notes,
          trailer: mapTrailerToTrailerDtoSelective(rel.trailer, [
            'id',
            'code',
            'manufactureYear',
            'manufacturer',
            'plateNumber',
          ]) as any,
        }));
      } else if (key in owner && owner[key as keyof Owner] !== undefined) {
        (dto as any)[key] = owner[key as keyof Owner];
      }
    });

    return dto;
  };

  return Array.isArray(ownerOrOwners) ? ownerOrOwners.map(mapSingle) : mapSingle(ownerOrOwners);
}

/**
 * CreateOwnerDTO → Owner entity (with relations ready for cascade save)
 */
export function mapCreateOwnerDtoToEntity(dto: CreateOwnerDTO): Owner {
  const owner = new Owner();
  owner.name = dto.name;
  owner.phone = dto.phone;
  owner.email = dto.email;
  owner.address = dto.address;
  owner.paymentNumber = dto.paymentNumber;
  owner.transactionType = dto.transactionType;
  owner.notes = dto.notes;
  owner.bankAccountNumber = dto.bankAccountNumber;
  owner.bankName = dto.bankName;

  // Map car ownerships
  if (dto.carOwnerships?.length) {
    owner.carOwnerships = dto.carOwnerships.map((input) => {
      const rel = new RelCarOwner();
      rel.car = { id: input.carId } as Car;
      rel.percentage = input.percentage;
      return rel;
    });
  }

  // Map trailer ownerships
  if (dto.trailerOwnerships?.length) {
    owner.trailerOwnerships = dto.trailerOwnerships.map((input) => {
      const rel = new RelTrailerOwner();
      rel.trailer = { id: input.trailerId } as Trailer;
      rel.percentage = input.percentage;
      return rel;
    });
  }

  return owner;
}

/**
 * UpdateOwnerDTO → Existing Owner entity (full replace of ownerships)
 */
export function mapUpdateOwnerDtoToEntity(dto: UpdateOwnerDTO, existing: Owner): Owner {
  if (dto.name !== undefined) existing.name = dto.name;
  if (dto.phone !== undefined) existing.phone = dto.phone;
  if (dto.email !== undefined) existing.email = dto.email;
  if (dto.address !== undefined) existing.address = dto.address;
  if (dto.transactionType !== undefined) existing.transactionType = dto.transactionType;
  if (dto.paymentNumber !== undefined) existing.paymentNumber = dto.paymentNumber;
  if (dto.notes !== undefined) existing.notes = dto.notes;
  if (dto.bankAccountNumber !== undefined) existing.bankAccountNumber = dto.bankAccountNumber;
  if (dto.bankName !== undefined) existing.bankName = dto.bankName;

  if (dto.carOwnerships !== undefined) {
    // Full replace ownerships (cleanest with cascade: true)
    existing.carOwnerships = (dto.carOwnerships || []).map((input) => {
      const rel = new RelCarOwner();
      if (input.id) rel.id = input.id; // Keep ID if updating existing
      if (input.carId) rel.car = { id: input.carId } as Car;
      if (input.percentage !== undefined) rel.percentage = input.percentage;
      return rel;
    });
  }

  if (dto.trailerOwnerships !== undefined) {
    // Full replace ownerships (cleanest with cascade: true)
    existing.trailerOwnerships = (dto.trailerOwnerships || []).map((input) => {
      const rel = new RelTrailerOwner();
      if (input.id) rel.id = input.id; // Keep ID if updating existing
      if (input.trailerId) rel.trailer = { id: input.trailerId } as Trailer;
      if (input.percentage !== undefined) rel.percentage = input.percentage;
      return rel;
    });
  }

  return existing;
}
