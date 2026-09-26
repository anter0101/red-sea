import { mapUserCreateDtoToEntity, mapUserUpdateDtoToEntity } from '../user/user.mapper';
import { Driver } from './driver.entity';
import { CreateDriverDTO } from './dtos/create-driver.dto';
import { DriverDTO } from './dtos/driver.dto';
import { BaseDTO } from 'src/core/utils/base.dto';
import { UpdateDriverDTO } from './dtos/update-driver.dto';

const allowedDriverDtoKeys: ReadonlyArray<keyof DriverDTO | keyof BaseDTO> = [
  'id',
  'licenseNumber',
  'licenseExpiryDate',
  'createdBy',
  'updatedBy',
  'createdAt',
  'updatedAt',
  'user',
  'currentJourneyId',
  'currentCarId',
  'currentCarCode',
];

export function mapDriverToDriverDtoSelective(
  driver: Driver,
  keys?: (keyof DriverDTO | keyof BaseDTO)[],
  includeUser?: boolean,
): Partial<DriverDTO>;
export function mapDriverToDriverDtoSelective(
  drivers: Driver[],
  keys?: (keyof DriverDTO | keyof BaseDTO)[],
  includeUser?: boolean,
): Partial<DriverDTO>[];
export function mapDriverToDriverDtoSelective(
  driverOrDrivers: Driver | Driver[],
  keys?: (keyof DriverDTO | keyof BaseDTO)[],
): Partial<DriverDTO> | Partial<DriverDTO>[] {
  const mapSingle = (driver: Driver): Partial<DriverDTO> => {
    const resultDto: Partial<DriverDTO> = {};

    const keysToMap = (keys || allowedDriverDtoKeys).filter((key) =>
      (allowedDriverDtoKeys as Array<keyof DriverDTO | keyof BaseDTO>).includes(key),
    );

    keysToMap.forEach((key) => {
      if (key in driver && driver[key as keyof Driver] !== undefined) {
        (resultDto as any)[key] = driver[key as keyof Driver];
      }
    });

    return resultDto;
  };

  return Array.isArray(driverOrDrivers)
    ? driverOrDrivers.map(mapSingle)
    : mapSingle(driverOrDrivers);
}

export const mapCreateDriverDtoToEntity = async (dto: CreateDriverDTO): Promise<Driver> => {
  const driver = new Driver();
  driver.licenseNumber = dto.licenseNumber;
  driver.licenseExpiryDate = dto.licenseExpiryDate;
  driver.createdAt = dto.createdAt;

  driver.user = await mapUserCreateDtoToEntity(dto.user); // ✅ await async function

  return driver;
};

export const mapUpdateDriverDtoToEntity = async (dto: UpdateDriverDTO): Promise<Driver> => {
  const driver = new Driver();

  if (dto.id !== undefined) driver.id = dto.id;
  if (dto.licenseNumber !== undefined) driver.licenseNumber = dto.licenseNumber;
  if (dto.licenseExpiryDate !== undefined) driver.licenseExpiryDate = dto.licenseExpiryDate;
  if (dto.createdAt !== undefined) driver.createdAt = dto.createdAt;
  if (dto.user !== undefined) driver.user = await mapUserUpdateDtoToEntity(dto.user);

  return driver;
};
