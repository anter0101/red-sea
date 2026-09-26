import { Branch } from './branch.entity';
import { BranchDTO } from './dtos/branch.dto';
import { CreateBranchDTO } from './dtos/create-branch.dto';
import { UpdateBranchDTO } from './dtos/update-branch.dto';
import { BaseDTO } from 'src/core/utils/base.dto';

const allowedBranchDtoKeys: ReadonlyArray<keyof BranchDTO | keyof BaseDTO> = [
  'id',
  'name',
  'createdBy',
  'updatedBy',
  'createdAt',
  'updatedAt',
] as const;

/**
 * Selective mapper: maps Branch → BranchDTO (single or array)
 */
export function mapBranchToBranchDtoSelective(
  branch: Branch,
  keys?: (keyof BranchDTO | keyof BaseDTO)[],
): Partial<BranchDTO>;

export function mapBranchToBranchDtoSelective(
  branches: Branch[],
  keys?: (keyof BranchDTO | keyof BaseDTO)[],
): Partial<BranchDTO>[];

export function mapBranchToBranchDtoSelective(
  branchOrBranches: Branch | Branch[],
  keys?: (keyof BranchDTO | keyof BaseDTO)[],
): Partial<BranchDTO> | Partial<BranchDTO>[] {
  const mapSingle = (branch: Branch): Partial<BranchDTO> => {
    const resultDto: Partial<BranchDTO> = {};

    const keysToMap = (keys || allowedBranchDtoKeys).filter((key) =>
      (allowedBranchDtoKeys as readonly string[]).includes(key),
    );

    keysToMap.forEach((key) => {
      if (key in branch && branch[key as keyof Branch] !== undefined) {
        (resultDto as any)[key] = branch[key as keyof Branch];
      }
    });

    return resultDto;
  };

  return Array.isArray(branchOrBranches)
    ? branchOrBranches.map(mapSingle)
    : mapSingle(branchOrBranches);
}

/**
 * Create DTO → Entity
 */
export const mapCreateBranchDtoToEntity = (dto: CreateBranchDTO): Branch => {
  const entity = new Branch();

  entity.name = dto.name;

  // If you later add createdAt from DTO (optional)
  if (dto.createdAt !== undefined) {
    entity.createdAt = dto.createdAt;
  }

  return entity;
};

/**
 * Update DTO → Entity (partial update)
 */
export const mapUpdateBranchDtoToEntity = (dto: UpdateBranchDTO): Branch => {
  const entity = new Branch();

  if (dto.id !== undefined) entity.id = dto.id;
  if (dto.name !== undefined) entity.name = dto.name;
  if (dto.createdAt !== undefined) entity.createdAt = dto.createdAt;

  return entity;
};
