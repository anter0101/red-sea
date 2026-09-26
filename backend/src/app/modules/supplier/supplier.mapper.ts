import { Supplier } from './supplier.entity';
import { SupplierDTO } from './dtos/supplier.dto';
import { CreateSupplierDTO } from './dtos/create-supplier.dto';
import { UpdateSupplierDTO } from './dtos/update-supplier.dto';
import { BaseDTO } from 'src/core/utils/base.dto';
import { Government } from '../government/government.entity';
import { Branch } from '../branch/branch.entity';

/**
 * Allowed keys for selective DTO mapping
 */
const allowedSupplierDtoKeys: ReadonlyArray<keyof SupplierDTO | keyof BaseDTO> = [
  'id',
  'code',
  'name',
  'type',
  'government',
  'phone',
  'commercialRegister',
  'taxCard',
  'taxRegistrationNumber',

  // base dto fields
  'createdBy',
  'updatedBy',
  'createdAt',
  'updatedAt',
] as const;

/**
 * Selective mapper: maps Supplier → SupplierDTO (single or array)
 */
export function mapSupplierToSupplierDtoSelective(
  supplier: Supplier,
  keys?: (keyof SupplierDTO | keyof BaseDTO)[],
): Partial<SupplierDTO>;

export function mapSupplierToSupplierDtoSelective(
  suppliers: Supplier[],
  keys?: (keyof SupplierDTO | keyof BaseDTO)[],
): Partial<SupplierDTO>[];

export function mapSupplierToSupplierDtoSelective(
  data: Supplier | Supplier[],
  keys?: (keyof SupplierDTO | keyof BaseDTO)[],
): Partial<SupplierDTO> | Partial<SupplierDTO>[] {
  const mapSingle = (supplier: Supplier): Partial<SupplierDTO> => {
    const dto: Partial<SupplierDTO> = {};

    const keysToMap = (keys || allowedSupplierDtoKeys).filter((key) =>
      (allowedSupplierDtoKeys as readonly string[]).includes(key),
    );

    keysToMap.forEach((key) => {
      if (key === 'government') return;
      if (key in supplier && supplier[key as keyof Supplier] !== undefined) {
        (dto as any)[key] = supplier[key as keyof Supplier];
      }
    });

    if (keysToMap.includes('government') && supplier.government) {
      dto.government = {
        id: supplier.government.id,
        name: supplier.government.name,
      } as any;
    }

    return dto;
  };

  return Array.isArray(data) ? data.map(mapSingle) : mapSingle(data);
}

/**
 * Create DTO → Entity
 */
export const mapCreateSupplierDtoToEntity = (dto: CreateSupplierDTO): Supplier => {
  const entity = new Supplier();

  entity.name = dto.name;
  entity.type = dto.type;
  entity.phone = dto.phone;
  entity.commercialRegister = dto.commercialRegister;
  entity.taxCard = dto.taxCard;
  entity.taxRegistrationNumber = dto.taxRegistrationNumber;

  if (dto.governmentId !== undefined) {
    entity.government = { id: dto.governmentId } as Government;
  }

  if (dto.branchId !== undefined) {
    entity.branch = { id: dto.branchId } as Branch;
  }

  if (dto.createdAt !== undefined) entity.createdAt = dto.createdAt;

  return entity;
};

/**
 * Update DTO → Entity
 */
export const mapUpdateSupplierDtoToEntity = (dto: UpdateSupplierDTO): Supplier => {
  const entity = new Supplier();

  if (dto.id !== undefined) entity.id = dto.id;
  if (dto.name !== undefined) entity.name = dto.name;
  if (dto.type !== undefined) entity.type = dto.type;
  if (dto.phone !== undefined) entity.phone = dto.phone;
  if (dto.commercialRegister !== undefined) entity.commercialRegister = dto.commercialRegister;
  if (dto.taxCard !== undefined) entity.taxCard = dto.taxCard;
  if (dto.taxRegistrationNumber !== undefined)
    entity.taxRegistrationNumber = dto.taxRegistrationNumber;

  if (dto.governmentId !== undefined) {
    entity.government = { id: dto.governmentId } as Government;
  }

  if (dto.createdAt !== undefined) entity.createdAt = dto.createdAt;

  return entity;
};
