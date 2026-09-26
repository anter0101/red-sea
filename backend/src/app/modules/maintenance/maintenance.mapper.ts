import { Maintenance } from './maintenance.entity';
import { CreateMaintenanceDTO } from './dtos/create-maintenance.dto';
import { MaintenanceDTO } from './dtos/maintenance.dto';
import { BaseDTO } from 'src/core/utils/base.dto';
import { UpdateMaintenanceDTO } from './dtos/update-maintenance.dto';
import { Car } from '../car/car.entity';
import { Trailer } from '../trailer/trailer.entity';

const allowedKeys: ReadonlyArray<keyof MaintenanceDTO | keyof BaseDTO> = [
  'id',
  'maintenanceDate',
  'description',
  'cost',
  'notes',
  'car',
  'trailer',
  'createdBy',
  'updatedBy',
  'createdAt',
  'updatedAt',
];

export function mapMaintenanceToDtoSelective(
  item: Maintenance,
  keys?: (keyof MaintenanceDTO | keyof BaseDTO)[],
): Partial<MaintenanceDTO>;
export function mapMaintenanceToDtoSelective(
  items: Maintenance[],
  keys?: (keyof MaintenanceDTO | keyof BaseDTO)[],
): Partial<MaintenanceDTO>[];
export function mapMaintenanceToDtoSelective(
  itemOrItems: Maintenance | Maintenance[],
  keys?: (keyof MaintenanceDTO | keyof BaseDTO)[],
): Partial<MaintenanceDTO> | Partial<MaintenanceDTO>[] {
  const mapSingle = (item: Maintenance): Partial<MaintenanceDTO> => {
    const resultDto: Partial<MaintenanceDTO> = {};
    const keysToMap = (keys || allowedKeys).filter((key) => allowedKeys.includes(key));

    keysToMap.forEach((key) => {
      const value = (item as any)[key];
      if (value !== undefined) {
        (resultDto as any)[key] = value;
      }
    });

    if (item.car?.id) resultDto.carId = item.car.id;
    if (item.trailer?.id) resultDto.trailerId = item.trailer.id;

    return resultDto;
  };

  return Array.isArray(itemOrItems) ? itemOrItems.map(mapSingle) : mapSingle(itemOrItems);
}

export const mapCreateMaintenanceDtoToEntity = (dto: CreateMaintenanceDTO): Maintenance => {
  const entity = new Maintenance();
  if (dto.carId) {
    entity.car = new Car();
    entity.car.id = dto.carId;
  }
  if (dto.trailerId) {
    entity.trailer = new Trailer();
    entity.trailer.id = dto.trailerId;
  }
  entity.maintenanceDate = dto.maintenanceDate;
  entity.description = dto.description;
  entity.cost = dto.cost;
  entity.notes = dto.notes;
  return entity;
};

export const mapUpdateMaintenanceDtoToEntity = (dto: UpdateMaintenanceDTO): Maintenance => {
  const entity = new Maintenance();
  if (dto.id !== undefined) entity.id = dto.id;
  if (dto.maintenanceDate !== undefined) entity.maintenanceDate = dto.maintenanceDate;
  if (dto.description !== undefined) entity.description = dto.description;
  if (dto.cost !== undefined) entity.cost = dto.cost;
  if (dto.notes !== undefined) entity.notes = dto.notes;
  if (dto.carId !== undefined) {
    entity.car = new Car();
    entity.car.id = dto.carId;
  }
  if (dto.trailerId !== undefined) {
    entity.trailer = new Trailer();
    entity.trailer.id = dto.trailerId;
  }
  return entity;
};
