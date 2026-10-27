import { TrailerManufacturer } from './trailer-manufacturer.entity';
import { CreateTrailerManufacturerDTO } from './dtos/create-trailer-manufacturer.dto';
import { TrailerManufacturerDTO } from './dtos/trailer-manufacturer.dto';
import { BaseDTO } from 'src/core/utils/base.dto';

const allowedTrailerManufacturerDtoKeys: ReadonlyArray<
  keyof TrailerManufacturerDTO | keyof BaseDTO
> = ['id', 'name', 'createdBy', 'updatedBy', 'createdAt', 'updatedAt'];

/**
 * MAP TO DTO (Selective)
 */
export function mapTrailerManufacturerToDtoSelective(
  manufacturer: TrailerManufacturer | TrailerManufacturerDTO,
  keys?: (keyof TrailerManufacturerDTO | keyof BaseDTO)[],
): Partial<TrailerManufacturerDTO>;

export function mapTrailerManufacturerToDtoSelective(
  manufacturers: (TrailerManufacturer | TrailerManufacturerDTO)[],
  keys?: (keyof TrailerManufacturerDTO | keyof BaseDTO)[],
): Partial<TrailerManufacturerDTO>[];

export function mapTrailerManufacturerToDtoSelective(
  manufacturerOrList:
    TrailerManufacturer | TrailerManufacturerDTO | (TrailerManufacturer | TrailerManufacturerDTO)[],
  keys?: (keyof TrailerManufacturerDTO | keyof BaseDTO)[],
): Partial<TrailerManufacturerDTO> | Partial<TrailerManufacturerDTO>[] {
  const mapSingle = (
    manufacturer: TrailerManufacturer | TrailerManufacturerDTO,
  ): Partial<TrailerManufacturerDTO> => {
    const dto: Partial<TrailerManufacturerDTO> = {};

    const keysToMap = (keys || allowedTrailerManufacturerDtoKeys).filter((key) =>
      allowedTrailerManufacturerDtoKeys.includes(key),
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
  dto: CreateTrailerManufacturerDTO,
): TrailerManufacturer => {
  const entity = new TrailerManufacturer();

  entity.name = dto.name;
  entity.createdAt = dto.createdAt;

  return entity;
};
