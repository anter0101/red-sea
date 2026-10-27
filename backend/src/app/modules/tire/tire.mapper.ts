import { Tire } from './tire.entity';
import { TireDTO } from './dtos/tire.dto';
import { BaseDTO } from 'src/core/utils/base.dto';
import { CreateTireDTO } from './dtos/create-tire.dto';
import { UpdateTireDTO } from './dtos/update-tire.dto';
import { Axle } from '../axle/axle.entity';

/**
 * Defines allowed keys for mapping from Tire entity to DTO.
 * Include all scalar fields and base metadata.
 */
const allowedTireDtoKeys: ReadonlyArray<keyof TireDTO | keyof BaseDTO> = [
  'id',
  'serialNumber',
  'type',
  'healthPercentage',
  'location',
  'createdDate',
  'axle',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'createdBy',
  'updatedBy',
  'deletedBy',
];

/**
 * Maps a Tire entity (or array) to TireDTO(s) with selective field inclusion.
 */
export function mapTireToTireDtoSelective(
  entity: Tire,
  keys?: (keyof TireDTO | keyof BaseDTO)[],
): UpdateTireDTO;
export function mapTireToTireDtoSelective(
  entities: Tire[],
  keys?: (keyof TireDTO | keyof BaseDTO)[],
): UpdateTireDTO[];
export function mapTireToTireDtoSelective(
  input: Tire | Tire[],
  keys?: (keyof TireDTO | keyof BaseDTO)[],
): UpdateTireDTO | UpdateTireDTO[] {
  const mapSingle = (entity: Tire): UpdateTireDTO => {
    const resultDto: UpdateTireDTO = {};

    const keysToMap = (keys || allowedTireDtoKeys).filter((key) =>
      allowedTireDtoKeys.includes(key),
    );

    keysToMap.forEach((key) => {
      if (key in entity && entity[key] !== undefined) {
        (resultDto as any)[key] = entity[key];
      }
    });

    return resultDto;
  };

  return Array.isArray(input) ? input.map(mapSingle) : mapSingle(input);
}

/**
 * Maps a CreateTireDTO to a new Tire entity.
 * Used when creating new records before saving to DB.
 */
export function mapCreateTireDtoToEntity(dto: CreateTireDTO | CreateTireDTO[]): Tire | Tire[] {
  const mapSingle = (item: CreateTireDTO): Tire => {
    const tire = new Tire();

    if (item.serialNumber !== undefined) tire.serialNumber = item.serialNumber;
    if (item.type !== undefined) tire.type = item.type;
    if (item.healthPercentage !== undefined) tire.healthPercentage = item.healthPercentage;
    if (item.location !== undefined) tire.location = item.location;
    if (item.createdDate !== undefined) tire.createdDate = item.createdDate;

    if (item.axleId) {
      tire.axle = new Axle();
      tire.axle.id = item.axleId;
    }

    return tire;
  };

  return Array.isArray(dto) ? dto.map(mapSingle) : mapSingle(dto);
}

/**
 * Maps an UpdateTireDTO to an existing Tire entity.
 * Only defined fields in the DTO will update the entity.
 */
export function mapUpdateTireDtoToEntity(dto: UpdateTireDTO, existingTire?: Tire): Tire;
export function mapUpdateTireDtoToEntity(dto: UpdateTireDTO[], existingTires?: Tire[]): Tire[];
export function mapUpdateTireDtoToEntity(
  dto: UpdateTireDTO | UpdateTireDTO[],
  existing?: Tire | Tire[],
): Tire | Tire[] {
  const mapOne = (item: UpdateTireDTO, existingTire?: Tire): Tire => {
    const tire = existingTire ?? new Tire();

    if (item.id !== undefined) tire.id = item.id;
    if (item.serialNumber !== undefined) tire.serialNumber = item.serialNumber;
    if (item.type !== undefined) tire.type = item.type;
    if (item.healthPercentage !== undefined) tire.healthPercentage = item.healthPercentage;
    if (item.location !== undefined) tire.location = item.location;
    if (item.createdDate !== undefined) tire.createdDate = item.createdDate;

    if (item.axle !== undefined) tire.axle = item.axle as Axle;

    return tire;
  };

  if (Array.isArray(dto)) {
    if (!Array.isArray(existing)) {
      return dto.map((item) => mapOne(item));
    }
    return dto.map((item, index) => mapOne(item, existing[index]));
  }

  return mapOne(dto, Array.isArray(existing) ? undefined : existing);
}
