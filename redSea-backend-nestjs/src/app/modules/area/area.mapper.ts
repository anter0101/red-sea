import { BaseDTO } from 'src/core/utils/base.dto';
import { Area } from './area.entity';
import { AreaDTO } from './dtos/area.dto';
import { CreateAreaDTO } from './dtos/create-area.dto';
import { UpdateAreaDTO } from './dtos/update-area.dto';
import { Government } from '../government/government.entity';

const allowedAreaDtoKeys: ReadonlyArray<keyof AreaDTO | keyof BaseDTO> = [
  'id',
  'name',
  'government',
  'createdBy',
  'updatedBy',
  'createdAt',
  'updatedAt',
] as const;

export function mapAreaToAreaDtoSelective(
  area: Area,
  keys?: (keyof AreaDTO | keyof BaseDTO)[],
): Partial<AreaDTO>;

export function mapAreaToAreaDtoSelective(
  areas: Area[],
  keys?: (keyof AreaDTO | keyof BaseDTO)[],
): Partial<AreaDTO>[];

export function mapAreaToAreaDtoSelective(
  data: Area | Area[],
  keys?: (keyof AreaDTO | keyof BaseDTO)[],
): Partial<AreaDTO> | Partial<AreaDTO>[] {
  const mapSingle = (area: Area): Partial<AreaDTO> => {
    const dto: Partial<AreaDTO> = {};

    const keysToMap = (keys || allowedAreaDtoKeys).filter((key) =>
      (allowedAreaDtoKeys as readonly string[]).includes(key),
    );

    keysToMap.forEach((key) => {
      if (key in area && area[key as keyof Area] !== undefined) {
        (dto as any)[key] = area[key as keyof Area];
      }
    });

    if (area.government) {
      (dto as any).government = {
        id: area.government.id,
        name: area.government.name,
      };
    }

    return dto;
  };

  return Array.isArray(data) ? data.map(mapSingle) : mapSingle(data);
}

export const mapCreateAreaDtoToEntity = (dto: CreateAreaDTO): Area => {
  const entity = new Area();

  entity.name = dto.name;

  if (dto.governmentId !== undefined) entity.government = { id: dto.governmentId } as Government;

  if (dto.createdAt !== undefined) entity.createdAt = dto.createdAt;

  return entity;
};

export const mapUpdateAreaDtoToEntity = (dto: UpdateAreaDTO, existing: Area): Area => {
  const entity = new Area();

  entity.id = existing.id;
  entity.createdAt = existing.createdAt;

  entity.name = dto.name ?? existing.name;

  return entity;
};
