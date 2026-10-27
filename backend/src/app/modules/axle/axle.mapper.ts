// src/axle/axle.mapper.ts
import { Axle } from './axle.entity';
import { AxleDTO } from './dtos/axle.dto';
import { BaseDTO } from 'src/core/utils/base.dto';
import { CreateAxleDTO } from './dtos/create-axle.dto';
import { UpdateAxleDTO } from './dtos/update-axle.dto';
import { Car } from '../car/car.entity';
import { Trailer } from '../trailer/trailer.entity';
import { Tire } from '../tire/tire.entity';

const allowedAxleDtoKeys: ReadonlyArray<keyof AxleDTO | keyof BaseDTO> = [
  'id',
  'number',
  'car',
  'trailer',
  'tires',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'createdBy',
  'updatedBy',
  'deletedBy',
] as const;

/**
 * Entity → DTO (selective mapping)
 */
export function mapAxleToAxleDtoSelective(
  entity: Axle,
  keys?: (keyof AxleDTO | keyof BaseDTO)[],
): UpdateAxleDTO;
export function mapAxleToAxleDtoSelective(
  entities: Axle[],
  keys?: (keyof AxleDTO | keyof BaseDTO)[],
): UpdateAxleDTO[];
export function mapAxleToAxleDtoSelective(
  input: Axle | Axle[],
  keys?: (keyof AxleDTO | keyof BaseDTO)[],
): UpdateAxleDTO | UpdateAxleDTO[] {
  const mapSingle = (entity: Axle): UpdateAxleDTO => {
    const dto = {} as UpdateAxleDTO;
    const useKeys = keys?.length
      ? keys.filter((k) => allowedAxleDtoKeys.includes(k))
      : allowedAxleDtoKeys;

    useKeys.forEach((key) => {
      if (entity[key] !== undefined) {
        (dto as any)[key] = entity[key];
      }
    });

    return dto;
  };

  return Array.isArray(input) ? input.map(mapSingle) : mapSingle(input);
}

/**
 * CreateAxleDTO → Axle Entity (supports nested tire creation)
 */
export function mapCreateAxleDtoToEntity(dto: CreateAxleDTO | CreateAxleDTO[]): Axle | Axle[] {
  const mapSingle = (item: CreateAxleDTO): Axle => {
    const axle = new Axle();
    axle.number = item.number;

    // Link to parent (car or trailer) via ID
    if (item.carId !== undefined) {
      axle.car = Object.assign(new Car(), { id: item.carId });
    }
    if (item.trailerId !== undefined) {
      axle.trailer = Object.assign(new Trailer(), { id: item.trailerId });
    }

    // Nested tire creation — this is the new powerful part
    if (item.tires && item.tires.length > 0) {
      axle.tires = item.tires.map((tireDto) => {
        const tire = new Tire();
        tire.serialNumber = tireDto.serialNumber;
        tire.type = tireDto.type;
        tire.healthPercentage = tireDto.healthPercentage;
        tire.location = tireDto.location;
        tire.createdDate = tireDto.createdDate ?? new Date();
        // tire.axle will be auto-filled by TypeORM thanks to cascade: true
        return tire;
      });
    }

    return axle;
  };

  return Array.isArray(dto) ? dto.map(mapSingle) : mapSingle(dto);
}

/**
 * UpdateAxleDTO → Axle Entity (for PATCH/PUT)
 * Note: Nested updates (tires) are not supported here unless you extend UpdateAxleDTO
 */
export function mapUpdateAxleDtoToEntity(dto: UpdateAxleDTO, existingAxle?: Axle): Axle;
export function mapUpdateAxleDtoToEntity(dto: UpdateAxleDTO[], existingAxles?: Axle[]): Axle[];
export function mapUpdateAxleDtoToEntity(
  dto: UpdateAxleDTO | UpdateAxleDTO[],
  existing?: Axle | Axle[],
): Axle | Axle[] {
  const mapOne = (item: UpdateAxleDTO, existingAxle?: Axle): Axle => {
    const axle = existingAxle ?? new Axle();

    if (item.id !== undefined) axle.id = item.id;
    if (item.number !== undefined) axle.number = item.number;

    // These are full objects — only use if sent (usually not in update)
    if (item.car !== undefined) axle.car = item.car as Car;
    if (item.trailer !== undefined) axle.trailer = item.trailer as Trailer;
    if (item.tires !== undefined) axle.tires = item.tires as Tire[];

    return axle;
  };

  if (Array.isArray(dto)) {
    return Array.isArray(existing)
      ? dto.map((item, i) => mapOne(item, existing[i]))
      : dto.map((item) => mapOne(item));
  }
  return mapOne(dto, existing as Axle);
}
