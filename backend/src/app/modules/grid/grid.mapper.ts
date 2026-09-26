import { UpdateGridsDTO } from './dtos/update-grids.dto';

import { Grids } from './grid.entity';
import { CreateGridsDTO } from './dtos/create-grids.dto';
import { GridsDTO } from './dtos/grids.dto';
import { BaseDTO } from 'src/core/utils/base.dto';

const allowedGridsDtoKeys: ReadonlyArray<keyof GridsDTO | keyof BaseDTO> = [
  'id',
  'user',
  'pageKey',
  'columns',
  'createdBy',
  'updatedBy',
  'createdAt',
  'updatedAt',
];

import { UserDTO } from '../user/dtos/user.dto';

export function mapGridsToDtoSelective(
  grids: Grids | GridsDTO,
  keys?: (keyof GridsDTO | keyof BaseDTO)[],
): Partial<GridsDTO>;

export function mapGridsToDtoSelective(
  gridsArr: (Grids | GridsDTO)[],
  keys?: (keyof GridsDTO | keyof BaseDTO)[],
): Partial<GridsDTO>[];

export function mapGridsToDtoSelective(
  gridsOrList: Grids | GridsDTO | (Grids | GridsDTO)[],
  keys?: (keyof GridsDTO | keyof BaseDTO)[],
): Partial<GridsDTO> | Partial<GridsDTO>[] {
  const mapSingle = (grids: Grids | GridsDTO): Partial<GridsDTO> => {
    const dto: Partial<GridsDTO> = {};
    const keysToMap = (keys || allowedGridsDtoKeys).filter((key) =>
      allowedGridsDtoKeys.includes(key),
    );
    keysToMap.forEach((key) => {
      let value = (grids as any)[key];
      if (key === 'user' && value) {
        // Map user entity to UserDTO if needed
        value =
          value instanceof Object && !(value instanceof UserDTO)
            ? Object.assign(new UserDTO(), value)
            : value;
      }
      if (key === 'columns' && value && typeof value === 'string') {
        // If columns is stored as a string (should be JSON), parse it
        try {
          value = JSON.parse(value);
        } catch {
          value = [];
        }
      }
      if (value !== undefined) {
        (dto as any)[key] = value;
      }
    });
    return dto;
  };
  return Array.isArray(gridsOrList) ? gridsOrList.map(mapSingle) : mapSingle(gridsOrList);
}

export const mapCreateGridsDtoToEntity = (
  dto: Pick<CreateGridsDTO, 'pageKey' | 'columns'>,
  user: any,
): Grids => {
  const entity = new Grids();
  entity.user = user;
  entity.pageKey = dto.pageKey;
  entity.columns = dto.columns ?? [];
  return entity;
};
export const mapUpdateGridsDtoToEntity = (dto: UpdateGridsDTO, entity: Grids): Grids => {
  if (dto.columns !== undefined) entity.columns = dto.columns;
  // Add more fields as needed
  return entity;
};
