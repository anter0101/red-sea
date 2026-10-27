import { Salary } from './salary.entity';
import { SalaryDTO } from './dtos/salary.dto';
import { CreateSalaryDTO } from './dtos/create-salary.dto';
import { UpdateSalaryDTO } from './dtos/update-salary.dto';
import { BaseDTO } from 'src/core/utils/base.dto';
import { mapUserToUserDtoSelective } from '../user/user.mapper';
import { User } from '../user/user.entity';
import { SalaryType } from 'src/core/enums/salary';

const allowedSalaryDtoKeys: ReadonlyArray<keyof SalaryDTO | keyof BaseDTO> = [
  'id',
  'salaryType',
  'salaryAmount',
  'dailyWorkPrice',
  'commissionPerJourney',
  'commissionIsPercentage',
  'nolonPercent',
  'createdBy',
  'updatedBy',
  'createdAt',
  'updatedAt',
];

export function mapSalaryToSalaryDtoSelective(
  salary: Salary,
  keys?: (keyof SalaryDTO | keyof BaseDTO)[],
  includeUser?: boolean,
): Partial<SalaryDTO>;
export function mapSalaryToSalaryDtoSelective(
  salaries: Salary[],
  keys?: (keyof SalaryDTO | keyof BaseDTO)[],
  includeUser?: boolean,
): Partial<SalaryDTO>[];
export function mapSalaryToSalaryDtoSelective(
  salaryOrSalaries: Salary | Salary[],
  keys?: (keyof SalaryDTO | keyof BaseDTO)[],
  includeUser = false,
): Partial<SalaryDTO> | Partial<SalaryDTO>[] {
  const mapSingle = (salary: Salary): Partial<SalaryDTO> => {
    const resultDto: Partial<SalaryDTO> = {};

    const keysToMap = (keys || allowedSalaryDtoKeys).filter((key) =>
      allowedSalaryDtoKeys.includes(key),
    );

    keysToMap.forEach((key) => {
      if (key in salary && salary[key as keyof Salary] !== undefined) {
        (resultDto as any)[key] = salary[key as keyof Salary];
      }
    });

    if (includeUser && salary.user) {
      (resultDto as any).user = mapUserToUserDtoSelective(salary.user);
    }

    return resultDto;
  };

  return Array.isArray(salaryOrSalaries)
    ? salaryOrSalaries.map(mapSingle)
    : mapSingle(salaryOrSalaries);
}

/** Clear fields that do not apply to the selected scheme. */
export function normalizeSalaryFieldsByType<
  T extends {
    salaryType?: SalaryType;
    salaryAmount?: number | null;
    dailyWorkPrice?: number | null;
    commissionPerJourney?: number | null;
    commissionIsPercentage?: boolean | null;
    nolonPercent?: number | null;
  },
>(dto: T): T {
  const type = dto.salaryType;
  if (type === SalaryType.MONTHLY) {
    return {
      ...dto,
      commissionPerJourney: null,
      commissionIsPercentage: null,
      nolonPercent: null,
    };
  }
  if (type === SalaryType.COMMISSION) {
    return {
      ...dto,
      salaryAmount: null,
      commissionPerJourney: null,
      commissionIsPercentage: null,
      nolonPercent: null,
    };
  }
  if (type === SalaryType.NOLON_PERCENT) {
    return {
      ...dto,
      salaryAmount: null,
      dailyWorkPrice: null,
      commissionPerJourney: null,
      commissionIsPercentage: null,
      nolonPercent: null,
    };
  }
  return dto;
}

export function mapCreateSalaryDtoToEntity(dto: CreateSalaryDTO): Salary {
  const normalized = normalizeSalaryFieldsByType(dto);
  const entity = new Salary();
  entity.salaryType = normalized.salaryType;
  entity.salaryAmount = normalized.salaryAmount ?? undefined;
  entity.dailyWorkPrice = normalized.dailyWorkPrice ?? undefined;
  entity.commissionPerJourney = normalized.commissionPerJourney ?? undefined;
  entity.commissionIsPercentage = normalized.commissionIsPercentage ?? undefined;
  entity.nolonPercent = normalized.nolonPercent ?? undefined;

  if (dto.userId) {
    entity.user = new User();
    entity.user.id = dto.userId;
  }

  entity.createdBy = dto.createdBy;
  return entity;
}

export function mapUpdateSalaryDtoToEntity(dto: UpdateSalaryDTO, existing: SalaryDTO): Salary {
  const normalized = normalizeSalaryFieldsByType({
    salaryType: dto.salaryType ?? existing.salaryType,
    salaryAmount: dto.salaryAmount !== undefined ? dto.salaryAmount : existing.salaryAmount,
    dailyWorkPrice: dto.dailyWorkPrice !== undefined ? dto.dailyWorkPrice : existing.dailyWorkPrice,
    commissionPerJourney:
      dto.commissionPerJourney !== undefined
        ? dto.commissionPerJourney
        : existing.commissionPerJourney,
    commissionIsPercentage:
      dto.commissionIsPercentage !== undefined
        ? dto.commissionIsPercentage
        : existing.commissionIsPercentage,
    nolonPercent: dto.nolonPercent !== undefined ? dto.nolonPercent : existing.nolonPercent,
  });

  if (dto.id !== undefined) existing.id = dto.id;
  if (dto.salaryType !== undefined) existing.salaryType = dto.salaryType;
  existing.salaryAmount = normalized.salaryAmount;
  existing.dailyWorkPrice = normalized.dailyWorkPrice;
  existing.commissionPerJourney = normalized.commissionPerJourney;
  existing.commissionIsPercentage = normalized.commissionIsPercentage;
  existing.nolonPercent = normalized.nolonPercent;
  if (dto.updatedBy !== undefined) existing.updatedBy = dto.updatedBy;

  return existing as Salary;
}
