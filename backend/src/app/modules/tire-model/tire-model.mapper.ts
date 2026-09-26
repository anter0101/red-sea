import { TireModel } from './tire-model.entity';
import { CreateTireModelDTO } from './dtos/create-tire-model.dto';
import { UpdateTireModelDTO } from './dtos/update-tire-model.dto';
import { TireModelDTO } from './dtos/tire-model.dto';
import { BaseDTO } from 'src/core/utils/base.dto';

const allowedTireModelDtoKeys: ReadonlyArray<keyof TireModelDTO | keyof BaseDTO> = [
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
export function mapTireModelToDtoSelective(
  model: TireModel | TireModelDTO,
  keys?: (keyof TireModelDTO | keyof BaseDTO)[],
): Partial<TireModelDTO>;

export function mapTireModelToDtoSelective(
  models: (TireModel | TireModelDTO)[],
  keys?: (keyof TireModelDTO | keyof BaseDTO)[],
): Partial<TireModelDTO>[];

export function mapTireModelToDtoSelective(
  modelOrList: TireModel | TireModelDTO | (TireModel | TireModelDTO)[],
  keys?: (keyof TireModelDTO | keyof BaseDTO)[],
): Partial<TireModelDTO> | Partial<TireModelDTO>[] {
  const mapSingle = (model: TireModel | TireModelDTO): Partial<TireModelDTO> => {
    const dto: Partial<TireModelDTO> = {};

    const keysToMap = (keys || allowedTireModelDtoKeys).filter((key) =>
      allowedTireModelDtoKeys.includes(key),
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
export const mapCreateTireModelDtoToEntity = (dto: CreateTireModelDTO): TireModel => {
  const entity = new TireModel();

  entity.name = dto.name;

  return entity;
};

/**
 * UPDATE MAPPER
 */
export const mapUpdateTireModelDtoToEntity = (dto: UpdateTireModelDTO): TireModel => {
  const entity = new TireModel();

  if (dto.id !== undefined) entity.id = dto.id;
  if (dto.name !== undefined) entity.name = dto.name;

  return entity;
};
