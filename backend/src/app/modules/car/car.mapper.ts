import { Car } from './car.entity';
import { CarDTO } from './dtos/car.dto';
import { CreateCarDTO } from './dtos/create-car.dto';
import { UpdateCarDTO } from './dtos/update-car.dto';
import { BaseDTO } from 'src/core/utils/base.dto';

/**
 * Allowed DTO keys for selective mapping.
 * Ensures security and prevents exposing extra fields.
 */
const allowedCarDtoKeys: ReadonlyArray<keyof CarDTO | keyof BaseDTO> = [
  'id',
  'code',
  'manufacturer',
  'status',
  'model',
  'manufactureYear',
  'color',
  'cylinders',
  'horsepower',
  'axleCount',
  'maxWeight',
  'plateNumber',
  'plateLetters',
  'chassisNumber',
  'licenseNumber',
  'licenseExpiryDate',
  'ownerShip',
  'axles',
  'Ownerships',
  'carAttachments',
  'notes',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
];

/**
 * Selective Car → CarDTO mapper
 */
export function mapCarToCarDtoSelective(
  car: Car,
  keys?: (keyof CarDTO | keyof BaseDTO)[],
): Partial<CarDTO>;
export function mapCarToCarDtoSelective(
  cars: Car[],
  keys?: (keyof CarDTO | keyof BaseDTO)[],
): Partial<CarDTO>[];
export function mapCarToCarDtoSelective(
  carOrCars: Car | Car[],
  keys?: (keyof CarDTO | keyof BaseDTO)[],
): Partial<CarDTO> | Partial<CarDTO>[] {
  const mapSingle = (car: Car): Partial<CarDTO> => {
    const dto: Partial<CarDTO> = {};

    const keysToMap = (keys || allowedCarDtoKeys).filter((key) => allowedCarDtoKeys.includes(key));

    keysToMap.forEach((key) => {
      if (key in car && car[key as keyof Car] !== undefined) {
        (dto as any)[key] = car[key as keyof Car];
      }

      if (key === 'axles' && car.axles) {
        (dto as any).axles = car.axles;
      }
    });

    return dto;
  };

  return Array.isArray(carOrCars) ? carOrCars.map(mapSingle) : mapSingle(carOrCars);
}

/**
 * CreateCarDTO → Car Entity
 */
export const mapCreateCarDtoToEntity = (dto: CreateCarDTO): Car => {
  const car = new Car();

  if (dto.manufacturer !== undefined) car.manufacturer = dto.manufacturer;
  if (dto.status !== undefined) car.status = dto.status;
  if (dto.model !== undefined) car.model = dto.model;
  if (dto.manufactureYear !== undefined) car.manufactureYear = dto.manufactureYear;
  if (dto.color !== undefined) car.color = dto.color;
  if (dto.cylinders !== undefined) car.cylinders = dto.cylinders;
  if (dto.horsepower !== undefined) car.horsepower = dto.horsepower;
  if (dto.axleCount !== undefined) car.axleCount = dto.axleCount;
  if (dto.maxWeight !== undefined) car.maxWeight = dto.maxWeight;
  if (dto.plateNumber !== undefined) car.plateNumber = dto.plateNumber;
  if (dto.plateLetters !== undefined) car.plateLetters = dto.plateLetters;
  if (dto.chassisNumber !== undefined) car.chassisNumber = dto.chassisNumber;
  if (dto.licenseNumber !== undefined) car.licenseNumber = dto.licenseNumber;
  if (dto.ownerShip !== undefined) car.ownerShip = dto.ownerShip;
  if (dto.licenseExpiryDate !== undefined) {
    car.licenseExpiryDate = new Date(dto.licenseExpiryDate);
  }
  if (dto.notes !== undefined) car.notes = dto.notes;

  return car;
};

/**
 * Apply UpdateCarDTO fields onto an existing Car entity.
 */
export const applyUpdateCarDtoToEntity = (dto: UpdateCarDTO, car: Car): Car => {
  if (dto.code !== undefined) car.code = dto.code;
  if (dto.manufacturer !== undefined) car.manufacturer = dto.manufacturer;
  if (dto.status !== undefined) car.status = dto.status;
  if (dto.model !== undefined) car.model = dto.model;
  if (dto.manufactureYear !== undefined) car.manufactureYear = dto.manufactureYear;
  if (dto.color !== undefined) car.color = dto.color;
  if (dto.cylinders !== undefined) car.cylinders = dto.cylinders;
  if (dto.horsepower !== undefined) car.horsepower = dto.horsepower;
  if (dto.axleCount !== undefined) car.axleCount = dto.axleCount;
  if (dto.maxWeight !== undefined) car.maxWeight = dto.maxWeight;
  if (dto.plateNumber !== undefined) car.plateNumber = dto.plateNumber;
  if (dto.plateLetters !== undefined) car.plateLetters = dto.plateLetters;
  if (dto.chassisNumber !== undefined) car.chassisNumber = dto.chassisNumber;
  if (dto.licenseNumber !== undefined) car.licenseNumber = dto.licenseNumber;
  if (dto.ownerShip !== undefined) car.ownerShip = dto.ownerShip;
  if (dto.licenseExpiryDate !== undefined) {
    car.licenseExpiryDate = new Date(dto.licenseExpiryDate);
  }
  if (dto.notes !== undefined) car.notes = dto.notes;

  return car;
};

/**
 * @deprecated Use applyUpdateCarDtoToEntity with loaded entity
 */
export const mapUpdateCarDtoToEntity = (dto: UpdateCarDTO): Car => {
  const car = new Car();
  if (dto.id !== undefined) car.id = dto.id;
  return applyUpdateCarDtoToEntity(dto, car);
};
