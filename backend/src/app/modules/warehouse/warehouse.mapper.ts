import { Warehouse } from './warehouse.entity';
import { WarehouseDTO } from './dtos/warehouse.dto';
import { CreateWarehouseDTO } from './dtos/create-warehouse.dto';
import { UpdateWarehouseDTO } from './dtos/update-warehouse.dto';
import { BaseDTO } from 'src/core/utils/base.dto';
import { Supplier } from '../supplier/supplier.entity';

/**
 * Allowed keys for selective DTO mapping
 */
const allowedWarehouseDtoKeys: ReadonlyArray<keyof WarehouseDTO | keyof BaseDTO> = [
  'id',
  'code',
  'name',
  'status',
  'condition',
  'category',
  'quantity',
  'alertQuantity',
  'unit',
  'supplier',
  'unitPrice',
  'manufacturingYear',
  'purchaseDate',
  'expiryDate',
  'lastUsedDate',

  // base dto fields
  'createdBy',
  'updatedBy',
  'createdAt',
  'updatedAt',
] as const;

/**
 * Selective mapper: maps Warehouse → WarehouseDTO (single or array)
 */
export function mapWarehouseToWarehouseDtoSelective(
  warehouse: Warehouse,
  keys?: (keyof WarehouseDTO | keyof BaseDTO)[],
): Partial<WarehouseDTO>;

export function mapWarehouseToWarehouseDtoSelective(
  warehouses: Warehouse[],
  keys?: (keyof WarehouseDTO | keyof BaseDTO)[],
): Partial<WarehouseDTO>[];

export function mapWarehouseToWarehouseDtoSelective(
  data: Warehouse | Warehouse[],
  keys?: (keyof WarehouseDTO | keyof BaseDTO)[],
): Partial<WarehouseDTO> | Partial<WarehouseDTO>[] {
  const mapSingle = (warehouse: Warehouse): Partial<WarehouseDTO> => {
    const dto: Partial<WarehouseDTO> = {};

    const keysToMap = (keys || allowedWarehouseDtoKeys).filter((key) =>
      (allowedWarehouseDtoKeys as readonly string[]).includes(key),
    );

    keysToMap.forEach((key) => {
      if (key === 'lastUsedDate') return;
      if (key === 'supplier') return;
      if (key in warehouse && warehouse[key as keyof Warehouse] !== undefined) {
        (dto as any)[key] = warehouse[key as keyof Warehouse];
      }
    });

    if (keysToMap.includes('supplier') && warehouse.supplier) {
      dto.supplier = {
        id: warehouse.supplier.id,
        name: (warehouse.supplier as any).name,
        code: (warehouse.supplier as any).code,
      } as any;
    }

    return dto;
  };

  return Array.isArray(data) ? data.map(mapSingle) : mapSingle(data);
}

/**
 * Create DTO → Entity
 */
export const mapCreateWarehouseDtoToEntity = (dto: CreateWarehouseDTO): Warehouse => {
  const entity = new Warehouse();

  entity.name = dto.name;
  entity.status = dto.status;
  entity.condition = dto.condition;
  entity.category = dto.category;
  entity.quantity = dto.quantity;
  entity.alertQuantity = dto.alertQuantity;
  entity.unit = dto.unit;
  entity.supplier = { id: dto.supplierId } as Supplier;
  entity.unitPrice = dto.unitPrice;
  entity.manufacturingYear = dto.manufacturingYear;
  entity.purchaseDate = dto.purchaseDate;
  entity.expiryDate = dto.expiryDate;

  if (dto.createdAt !== undefined) entity.createdAt = dto.createdAt;

  return entity;
};

/**
 * Update DTO → Entity
 */
export const mapUpdateWarehouseDtoToEntity = (dto: UpdateWarehouseDTO): Warehouse => {
  const entity = new Warehouse();

  if (dto.id !== undefined) entity.id = dto.id;
  if (dto.name !== undefined) entity.name = dto.name;
  if (dto.status !== undefined) entity.status = dto.status;
  if (dto.condition !== undefined) entity.condition = dto.condition;
  if (dto.category !== undefined) entity.category = dto.category;
  // quantity is stock — only changed via stock movements, not product update
  if (dto.alertQuantity !== undefined) entity.alertQuantity = dto.alertQuantity;
  if (dto.unit !== undefined) entity.unit = dto.unit;
  if (dto.supplierId !== undefined) entity.supplier = { id: dto.supplierId } as Supplier;
  if (dto.unitPrice !== undefined) entity.unitPrice = dto.unitPrice;
  if (dto.manufacturingYear !== undefined) entity.manufacturingYear = dto.manufacturingYear;
  if (dto.purchaseDate !== undefined) entity.purchaseDate = dto.purchaseDate;
  if (dto.expiryDate !== undefined) entity.expiryDate = dto.expiryDate;

  if (dto.createdAt !== undefined) entity.createdAt = dto.createdAt;

  return entity;
};
