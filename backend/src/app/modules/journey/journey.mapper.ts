import { Journey } from './journey.entity';
import { JourneyDTO } from './dtos/journey.dto';
import { CreateJourneyDTO } from './dtos/create-journey.dto';
import { UpdateJourneyDTO } from './dtos/update-journey.dto';
import { BaseDTO } from 'src/core/utils/base.dto';
import { Driver } from '../driver/driver.entity';
import { User } from '../user/user.entity';
import { Car } from '../car/car.entity';
import { Trailer } from '../trailer/trailer.entity';
import { Client } from '../factory/client.entity';
import { Employee } from '../employee/employee.entity';

const allowedJourneyDtoKeys: ReadonlyArray<keyof JourneyDTO | keyof BaseDTO> = [
  'id',
  'delegateNumber',
  'delegateDate',
  'tripStatus',
  'driver',
  'delegateDate',
  'delegateNumber',
  'driverAssistant',
  'custodySource',
  'receivedCompany',
  'sellingOrderNo',
  'car',
  'trailer',
  'direction',
  'client',
  'quantity',
  'expectedRevenue',
  'actualRevenue',
  'cementGrade',
  'packingType',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
];

export function mapJourneyToDtoSelective(
  journey: Journey,
  keys?: (keyof JourneyDTO | keyof BaseDTO)[],
): Partial<JourneyDTO>;
export function mapJourneyToDtoSelective(
  journeys: Journey[],
  keys?: (keyof JourneyDTO | keyof BaseDTO)[],
): Partial<JourneyDTO>[];
export function mapJourneyToDtoSelective(
  journeyOrList: Journey | Journey[],
  keys?: (keyof JourneyDTO | keyof BaseDTO)[],
): Partial<JourneyDTO> | Partial<JourneyDTO>[] {
  const mapSingle = (journey: Journey): Partial<JourneyDTO> => {
    const dto: Partial<JourneyDTO> = {};
    const keysToMap = (keys || allowedJourneyDtoKeys).filter((key) =>
      allowedJourneyDtoKeys.includes(key),
    );

    keysToMap.forEach((key) => {
      const value = (journey as any)[key];
      if (value !== undefined) {
        (dto as any)[key] = value;
      }
    });

    return dto;
  };

  return Array.isArray(journeyOrList)
    ? journeyOrList.map((j) => mapSingle(j))
    : mapSingle(journeyOrList);
}

export const mapCreateJourneyDtoToEntity = (dto: CreateJourneyDTO): Journey => {
  const entity = new Journey();
  entity.delegateDate = dto.delegateDate;

  entity.tripStatus = dto.tripStatus;
  entity.receivedCompany = dto.receivedCompany;
  entity.sellingOrderNo = dto.sellingOrderNo;

  // new fields
  entity.direction = dto.direction;
  entity.quantity = dto.quantity;
  entity.cementGrade = dto.cementGrade;
  entity.packingType = dto.packingType;

  if (dto.driverId) {
    entity.driver = { id: dto.driverId } as Driver;
  }

  if (dto.driverAssistantId) {
    entity.assistant = { id: dto.driverAssistantId } as User;
  }

  if (dto.carId) {
    entity.car = { id: dto.carId } as Car;
  }

  if (dto.trailerId) {
    entity.trailer = { id: dto.trailerId } as Trailer;
  }

  if (dto.clientId) {
    entity.client = { id: dto.clientId } as Client;
  }

  return entity;
};

export const mapUpdateJourneyDtoToEntity = (dto: UpdateJourneyDTO, existing: Journey): Journey => {
  if (dto.tripStatus !== undefined) existing.tripStatus = dto.tripStatus;
  if (dto.delegateDate !== undefined) existing.delegateDate = dto.delegateDate;

  // new fields
  if (dto.direction !== undefined) existing.direction = dto.direction;
  if (dto.quantity !== undefined) existing.quantity = dto.quantity;
  if (dto.cementGrade !== undefined) existing.cementGrade = dto.cementGrade;
  if (dto.packingType !== undefined) existing.packingType = dto.packingType;

  if (dto.driverId !== undefined) existing.driver = { id: dto.driverId } as Driver;
  if (dto.driverAssistantId !== undefined)
    existing.assistant = { id: dto.driverAssistantId } as User;
  if (dto.carId !== undefined) existing.car = { id: dto.carId } as Car;
  if (dto.trailerId !== undefined) existing.trailer = { id: dto.trailerId } as Trailer;
  if (dto.clientId !== undefined) existing.client = { id: dto.clientId } as Client;

  if (dto.receivedCompany !== undefined) existing.receivedCompany = dto.receivedCompany;
  if (dto.sellingOrderNo !== undefined) existing.sellingOrderNo = dto.sellingOrderNo;

  return existing;
};
