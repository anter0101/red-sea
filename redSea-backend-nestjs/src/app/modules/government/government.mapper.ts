import { BaseDTO } from 'src/core/utils/base.dto';
import { Government } from './government.entity';
import { GovernmentDTO } from './dtos/government.dto';
import { CreateGovernmentDTO } from './dtos/create-government.dto';
import { UpdateGovernmentDTO } from './dtos/update-government.dto';

const allowedGovernmentDtoKeys: ReadonlyArray<keyof GovernmentDTO | keyof BaseDTO> = [
  'id',
  'name',
  'createdBy',
  'updatedBy',
  'createdAt',
  'updatedAt',
] as const;

export function mapGovernmentToGovernmentDtoSelective(
  government: Government,
  keys?: (keyof GovernmentDTO | keyof BaseDTO)[],
): Partial<GovernmentDTO>;

export function mapGovernmentToGovernmentDtoSelective(
  governments: Government[],
  keys?: (keyof GovernmentDTO | keyof BaseDTO)[],
): Partial<GovernmentDTO>[];

export function mapGovernmentToGovernmentDtoSelective(
  data: Government | Government[],
  keys?: (keyof GovernmentDTO | keyof BaseDTO)[],
): Partial<GovernmentDTO> | Partial<GovernmentDTO>[] {
  const mapSingle = (government: Government): Partial<GovernmentDTO> => {
    const dto: Partial<GovernmentDTO> = {};

    const keysToMap = (keys || allowedGovernmentDtoKeys).filter((key) =>
      (allowedGovernmentDtoKeys as readonly string[]).includes(key),
    );

    keysToMap.forEach((key) => {
      if (key in government && government[key as keyof Government] !== undefined) {
        (dto as any)[key] = government[key as keyof Government];
      }
    });

    return dto;
  };

  return Array.isArray(data) ? data.map(mapSingle) : mapSingle(data);
}

export const mapCreateGovernmentDtoToEntity = (dto: CreateGovernmentDTO): Government => {
  const entity = new Government();

  entity.name = dto.name;

  if (dto.createdAt !== undefined) entity.createdAt = dto.createdAt;

  return entity;
};

export const mapUpdateGovernmentDtoToEntity = (dto: UpdateGovernmentDTO): Government => {
  const entity = new Government();

  if (dto.id !== undefined) entity.id = dto.id;
  if (dto.name !== undefined) entity.name = dto.name;

  if (dto.createdAt !== undefined) entity.createdAt = dto.createdAt;

  return entity;
};
