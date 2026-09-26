import { CarManufacturer } from './car-manufacturer.entity';
import { CreateCarManufacturerDTO } from './dtos/create-car-manufacturer.dto';
import { UpdateCarManufacturerDTO } from './dtos/update-car-manufacturer.dto';
import { CarManufacturerDTO } from './dtos/car-manufacturer.dto';
import { BaseDTO } from 'src/core/utils/base.dto';

const allowedCarManufacturerDtoKeys: ReadonlyArray<keyof CarManufacturerDTO | keyof BaseDTO> = [
  'id',
  'name',
  'createdBy',
  'updatedBy',
  'createdAt',
  'updatedAt',
];

/**
 * MAP TO DTO (Selective)
 */
export function mapCarManufacturerToDtoSelective(
  manufacturer: CarManufacturer | CarManufacturerDTO,
  keys?: (keyof CarManufacturerDTO | keyof BaseDTO)[],
): Partial<CarManufacturerDTO>;

export function mapCarManufacturerToDtoSelective(
  manufacturers: (CarManufacturer | CarManufacturerDTO)[],
  keys?: (keyof CarManufacturerDTO | keyof BaseDTO)[],
): Partial<CarManufacturerDTO>[];

export function mapCarManufacturerToDtoSelective(
  manufacturerOrList:
    | CarManufacturer
    | CarManufacturerDTO
    | (CarManufacturer | CarManufacturerDTO)[],
  keys?: (keyof CarManufacturerDTO | keyof BaseDTO)[],
): Partial<CarManufacturerDTO> | Partial<CarManufacturerDTO>[] {
  const mapSingle = (
    manufacturer: CarManufacturer | CarManufacturerDTO,
  ): Partial<CarManufacturerDTO> => {
    const dto: Partial<CarManufacturerDTO> = {};

    const keysToMap = (keys || allowedCarManufacturerDtoKeys).filter((key) =>
      allowedCarManufacturerDtoKeys.includes(key),
    );

    keysToMap.forEach((key) => {
      const value = (manufacturer as any)[key];
      if (value !== undefined) {
        (dto as any)[key] = value;
      }
    });

    return dto;
  };

  return Array.isArray(manufacturerOrList)
    ? manufacturerOrList.map(mapSingle)
    : mapSingle(manufacturerOrList);
}

/**
 * CREATE MAPPER
 */
export const mapCreateManufacturerDtoToEntity = (
  dto: CreateCarManufacturerDTO,
): CarManufacturer => {
  const entity = new CarManufacturer();

  entity.name = dto.name;
  entity.createdAt = dto.createdAt;

  return entity;
};

/**
 * UPDATE MAPPER
 */
export const mapUpdateManufacturerDtoToEntity = (
  dto: UpdateCarManufacturerDTO,
): CarManufacturer => {
  const entity = new CarManufacturer();

  if (dto.id !== undefined) entity.id = dto.id;
  if (dto.name !== undefined) entity.name = dto.name;

  return entity;
};
