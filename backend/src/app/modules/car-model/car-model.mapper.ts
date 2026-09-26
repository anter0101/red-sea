import { CarModel } from './car-model.entity';
import { CreateCarModelDTO } from './dtos/create-car-model.dto';
import { UpdateCarModelDTO } from './dtos/update-car-model.dto';
import { CarModelDTO } from './dtos/car-model.dto';
import { BaseDTO } from 'src/core/utils/base.dto';
import { CarManufacturer } from '../car-manufacturer/car-manufacturer.entity';

const allowedCarModelDtoKeys: ReadonlyArray<keyof CarModelDTO | keyof BaseDTO> = [
  'id',
  'name',
  'manufacturer',
  'createdBy',
  'updatedBy',
  'createdAt',
  'updatedAt',
];

/**
 * MAP TO DTO (Selective)
 */
export function mapCarModelToDtoSelective(
  model: CarModel | CarModelDTO,
  keys?: (keyof CarModelDTO | keyof BaseDTO)[],
): Partial<CarModelDTO>;

export function mapCarModelToDtoSelective(
  models: (CarModel | CarModelDTO)[],
  keys?: (keyof CarModelDTO | keyof BaseDTO)[],
): Partial<CarModelDTO>[];

export function mapCarModelToDtoSelective(
  modelOrList: CarModel | CarModelDTO | (CarModel | CarModelDTO)[],
  keys?: (keyof CarModelDTO | keyof BaseDTO)[],
): Partial<CarModelDTO> | Partial<CarModelDTO>[] {
  const mapSingle = (model: CarModel | CarModelDTO): Partial<CarModelDTO> => {
    const dto: Partial<CarModelDTO> = {};

    const keysToMap = (keys || allowedCarModelDtoKeys).filter((key) =>
      allowedCarModelDtoKeys.includes(key),
    );

    keysToMap.forEach((key) => {
      const value = (model as any)[key];
      if (value !== undefined) {
        (dto as any)[key] = value;
      }
    });

    return dto;
  };

  return Array.isArray(modelOrList) ? modelOrList.map(mapSingle) : mapSingle(modelOrList);
}

/**
 * CREATE MAPPER
 */
export const mapCreateCarModelDtoToEntity = (dto: CreateCarModelDTO): CarModel => {
  const entity = new CarModel();

  entity.name = dto.name;

  if (dto.manufacturerId) {
    entity.manufacturer = new CarManufacturer();
    entity.manufacturer.id = dto.manufacturerId;
  }

  return entity;
};

/**
 * UPDATE MAPPER
 */
export const mapUpdateCarModelDtoToEntity = (dto: UpdateCarModelDTO): CarModel => {
  const entity = new CarModel();

  if (dto.id !== undefined) entity.id = dto.id;
  if (dto.name !== undefined) entity.name = dto.name;

  return entity;
};
