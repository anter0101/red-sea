import { BaseDTO } from 'src/core/utils/base.dto';
import { PriceType } from './price-type.entity';
import { PriceTypeDTO } from './dtos/price-type.dto';
import { CreatePriceTypeDTO } from './dtos/create-price-type.dto';
import { UpdatePriceTypeDTO } from './dtos/update-price-type.dto';

const allowedPriceTypeDtoKeys: ReadonlyArray<keyof PriceTypeDTO | keyof BaseDTO> = [
  'id',
  'name',
  'description',
  'createdBy',
  'updatedBy',
  'createdAt',
  'updatedAt',
] as const;

export function mapPriceTypeToPriceTypeDtoSelective(
  priceType: PriceType,
  keys?: (keyof PriceTypeDTO | keyof BaseDTO)[],
): Partial<PriceTypeDTO>;

export function mapPriceTypeToPriceTypeDtoSelective(
  priceTypes: PriceType[],
  keys?: (keyof PriceTypeDTO | keyof BaseDTO)[],
): Partial<PriceTypeDTO>[];

export function mapPriceTypeToPriceTypeDtoSelective(
  data: PriceType | PriceType[],
  keys?: (keyof PriceTypeDTO | keyof BaseDTO)[],
): Partial<PriceTypeDTO> | Partial<PriceTypeDTO>[] {
  const mapSingle = (priceType: PriceType): Partial<PriceTypeDTO> => {
    const dto: Partial<PriceTypeDTO> = {};

    const keysToMap = (keys || allowedPriceTypeDtoKeys).filter((key) =>
      (allowedPriceTypeDtoKeys as readonly string[]).includes(key),
    );

    keysToMap.forEach((key) => {
      if (key in priceType && priceType[key] !== undefined) {
        (dto as any)[key] = priceType[key];
      }
    });

    return dto;
  };

  return Array.isArray(data) ? data.map(mapSingle) : mapSingle(data);
}

export const mapCreatePriceTypeDtoToEntity = (dto: CreatePriceTypeDTO): PriceType => {
  const entity = new PriceType();

  entity.name = dto.name;
  entity.description = dto.description;

  if (dto.createdAt !== undefined) entity.createdAt = dto.createdAt;

  return entity;
};

export const mapUpdatePriceTypeDtoToEntity = (
  dto: UpdatePriceTypeDTO,
  existing: PriceType,
): PriceType => {
  const entity = new PriceType();

  entity.id = existing.id;
  entity.createdAt = existing.createdAt;

  entity.name = dto.name ?? existing.name;
  entity.description = dto.description ?? existing.description;

  return entity;
};
