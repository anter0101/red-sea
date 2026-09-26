import { JourneyPolicyDTO } from './dtos/journey-policy.dto';
import { CreateJourneyPolicyDTO } from './dtos/create-journey-policy.dto';
import { UpdateJourneyPolicyDTO } from './dtos/update-journey-policy.dto';
import { BaseDTO } from 'src/core/utils/base.dto';
import { JourneyPolicy } from './journey-policy.entity';
import { Employee } from '../employee/employee.entity';
import { Area } from '../area/area.entity';
import { Government } from '../government/government.entity';

const allowedJourneyPolicyDtoKeys: ReadonlyArray<keyof JourneyPolicyDTO | keyof BaseDTO> = [
  'id',

  // main fields
  'journey',
  'goodsType',
  'bookWeight',
  'actualWeight',
  'deliveryWeight',
  'shortageQty',
  'policyNo',
  'policyDate',
  'entryTimeFactory',
  'exitTimeFactory',
  'loadingDate',
  'archiveNo',
  'loadingPermitNo',
  'tripDate',
  'tripDistance', // مسافة الرحلة
  // relations
  'deliveryArea',
  'deliveryGov',
  'employee',

  // base dto
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
];

export function mapJourneyPolicyToDtoSelective(
  policy: JourneyPolicy,
  keys?: (keyof JourneyPolicyDTO | keyof BaseDTO)[],
): Partial<JourneyPolicyDTO>;
export function mapJourneyPolicyToDtoSelective(
  list: JourneyPolicy[],
  keys?: (keyof JourneyPolicyDTO | keyof BaseDTO)[],
): Partial<JourneyPolicyDTO>[];
export function mapJourneyPolicyToDtoSelective(
  value: JourneyPolicy | JourneyPolicy[],
  keys?: (keyof JourneyPolicyDTO | keyof BaseDTO)[],
): Partial<JourneyPolicyDTO> | Partial<JourneyPolicyDTO>[] {
  const mapSingle = (policy: JourneyPolicy): Partial<JourneyPolicyDTO> => {
    const dto: Partial<JourneyPolicyDTO> = {};
    const keysToMap = (keys || allowedJourneyPolicyDtoKeys).filter((key) =>
      allowedJourneyPolicyDtoKeys.includes(key),
    );

    keysToMap.forEach((key) => {
      const val = (policy as any)[key];
      if (val !== undefined) {
        (dto as any)[key] = val;
      }
    });

    return dto;
  };

  return Array.isArray(value) ? value.map(mapSingle) : mapSingle(value);
}

export const mapCreateJourneyPolicyDtoToEntity = (dto: CreateJourneyPolicyDTO): JourneyPolicy => {
  const entity = new JourneyPolicy();
  entity.bookWeight = dto.bookWeight;
  entity.actualWeight = dto.actualWeight;
  entity.deliveryWeight = dto.deliveryWeight;
  entity.shortageQty = dto.shortageQty;
  entity.policyNo = dto.policyNo;
  entity.policyDate = dto.policyDate;
  entity.entryTimeFactory = dto.entryTimeFactory;
  entity.exitTimeFactory = dto.exitTimeFactory;
  entity.loadingDate = dto.loadingDate;
  entity.loadingPermitNo = dto.loadingPermitNo;
  entity.archiveNo = dto.archiveNo;
  entity.tripDate = dto.loadingDate ?? dto.policyDate;
  entity.tripDistance = dto.tripDistance;

  if (dto.employeeId) entity.employee = { id: dto.employeeId } as Employee;

  if (dto.deliveryAreaId) entity.deliveryArea = { id: dto.deliveryAreaId } as Area;

  if (dto.deliveryGovId) entity.deliveryGov = { id: dto.deliveryGovId } as Government;

  return entity;
};

export const mapUpdateJourneyPolicyDtoToEntity = (
  dto: UpdateJourneyPolicyDTO,
  existing: JourneyPolicy,
): JourneyPolicy => {
  if (dto.bookWeight !== undefined) existing.bookWeight = dto.bookWeight;
  if (dto.actualWeight !== undefined) existing.actualWeight = dto.actualWeight;
  if (dto.deliveryWeight !== undefined) existing.deliveryWeight = dto.deliveryWeight;
  if (dto.shortageQty !== undefined) existing.shortageQty = dto.shortageQty;

  if (dto.policyNo !== undefined) existing.policyNo = dto.policyNo;
  if (dto.policyDate !== undefined) existing.policyDate = dto.policyDate;

  if (dto.entryTimeFactory !== undefined) existing.entryTimeFactory = dto.entryTimeFactory;

  if (dto.exitTimeFactory !== undefined) existing.exitTimeFactory = dto.exitTimeFactory;

  if (dto.loadingDate !== undefined) existing.loadingDate = dto.loadingDate;

  if (dto.loadingPermitNo !== undefined) existing.loadingPermitNo = dto.loadingPermitNo;

  if (dto.archiveNo !== undefined) existing.archiveNo = dto.archiveNo;
  if (dto.tripDistance !== undefined) existing.tripDistance = dto.tripDistance;

  if (dto.tripDate !== undefined) existing.tripDate = dto.tripDate;
  if (dto.employeeId) existing.employee = { id: dto.employeeId } as Employee;

  if (dto.deliveryAreaId) existing.deliveryArea = { id: dto.deliveryAreaId } as Area;
  if (dto.deliveryGovId) existing.deliveryGov = { id: dto.deliveryGovId } as Government;

  return existing;
};
