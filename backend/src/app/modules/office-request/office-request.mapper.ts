import { BaseDTO } from 'src/core/utils/base.dto';
import { OfficeRequest } from './office-request.entity';
import { CreateOfficeRequestDTO } from './dtos/create-office-request.dto';
import { OfficeRequestActionDTO } from './dtos/office-request-action.dto';
import { Journey } from '../journey/journey.entity';
import { Employee } from '../employee/employee.entity';
import { OfficeRequestStatus, OfficeRequestType } from 'src/core/enums/office-request';
import { mapJourneyToDtoSelective } from '../journey/journey.mapper';
import { mapEmployeeToEmployeeDtoSelective } from '../employee/employee.mapper';
import { JourneyDTO } from '../journey/dtos/journey.dto';
import { EmployeeDTO } from '../employee/dtos/employee.dto';
import { OfficeRequestDTO } from './dtos/office-request.dto';

const allowedOfficeRequestDtoKeys: ReadonlyArray<keyof OfficeRequestDTO | keyof BaseDTO> = [
  'id',
  'status',
  'type',
  'description',
  'amount',
  'journey',
  'requestedFrom',
  'requestedTo',
  'createdBy',
  'updatedBy',
  'createdAt',
  'updatedAt',
] as const;

export function mapOfficeRequestToDtoSelective(
  request: OfficeRequest,
  keys?: (keyof OfficeRequestDTO | keyof BaseDTO)[],
  includeRelations?: boolean,
): Partial<OfficeRequestDTO>;

export function mapOfficeRequestToDtoSelective(
  requests: OfficeRequest[],
  keys?: (keyof OfficeRequestDTO | keyof BaseDTO)[],
  includeRelations?: boolean,
): Partial<OfficeRequestDTO>[];

export function mapOfficeRequestToDtoSelective(
  data: OfficeRequest | OfficeRequest[],
  keys?: (keyof OfficeRequestDTO | keyof BaseDTO)[],
  includeRelations = true,
): Partial<OfficeRequestDTO> | Partial<OfficeRequestDTO>[] {
  const mapSingle = (request: OfficeRequest): Partial<OfficeRequestDTO> => {
    const dto: Partial<OfficeRequestDTO> = {};

    const keysToMap = (keys || allowedOfficeRequestDtoKeys).filter((key) =>
      (allowedOfficeRequestDtoKeys as readonly string[]).includes(key),
    );

    keysToMap.forEach((key) => {
      if (
        key === 'journey' ||
        key === 'requestedFrom' ||
        key === 'requestedTo' ||
        key === 'amount'
      ) {
        return;
      }
      if (key in request && request[key as keyof OfficeRequest] !== undefined) {
        (dto as any)[key] = request[key as keyof OfficeRequest];
      }
    });

    if (request.type === OfficeRequestType.ASK_FOR_CUSTODY && request.description) {
      const parsed = Number(request.description);
      if (Number.isFinite(parsed) && parsed > 0) {
        dto.amount = parsed;
      }
    }

    if (includeRelations) {
      if (request.journey) {
        dto.journey = mapJourneyToDtoSelective(request.journey, [
          'id',
          'delegateNumber',
          'tripStatus',
        ]) as JourneyDTO;
      }

      if (request.requestedFrom) {
        dto.requestedFrom = mapEmployeeToEmployeeDtoSelective(request.requestedFrom, [
          'id',
          'user',
        ]) as EmployeeDTO;
      }

      if (request.requestedTo) {
        dto.requestedTo = mapEmployeeToEmployeeDtoSelective(request.requestedTo, [
          'id',
          'user',
        ]) as EmployeeDTO;
      }
    }

    return dto;
  };

  return Array.isArray(data) ? data.map(mapSingle) : mapSingle(data);
}

export interface OfficeRequestParties {
  requestedFromId: number;
  requestedToId: number;
}

export const mapCreateOfficeRequestDtoToEntity = (
  dto: CreateOfficeRequestDTO,
  parties: OfficeRequestParties,
): OfficeRequest => {
  const entity = new OfficeRequest();
  entity.status = OfficeRequestStatus.PENDING;
  entity.type = dto.type;
  entity.requestedFrom = { id: parties.requestedFromId } as Employee;
  entity.requestedTo = { id: parties.requestedToId } as Employee;

  switch (dto.type) {
    case OfficeRequestType.PRINT_DELEGATION:
      entity.journey = { id: dto.journeyId } as Journey;
      break;
    case OfficeRequestType.ASK_FOR_CUSTODY:
      entity.description = String(dto.amount);
      if (dto.journeyId) {
        entity.journey = { id: dto.journeyId } as Journey;
      }
      break;
    case OfficeRequestType.END_WORKING_SHIFT:
      if (dto.note !== undefined) {
        entity.description = dto.note;
      }
      if (dto.journeyId) {
        entity.journey = { id: dto.journeyId } as Journey;
      }
      break;
  }

  return entity;
};

export const applyOfficeRequestActionToEntity = (
  dto: OfficeRequestActionDTO,
  existing: OfficeRequest,
): OfficeRequest => {
  existing.status = dto.status;
  return existing;
};
