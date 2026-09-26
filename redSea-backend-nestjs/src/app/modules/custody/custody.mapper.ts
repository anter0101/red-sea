import { Custody } from './custody.entity';
import { CreateCustodyDTO } from './dtos/create-custody.dto';
import { CustodyDTO } from './dtos/custody.dto';
import { BaseDTO } from 'src/core/utils/base.dto';
import { UpdateCustodyDTO } from './dtos/update-custody.dto';
import { Employee } from '../employee/employee.entity';
import { Account } from '../account/account.entity';
import { Journey } from '../journey/journey.entity';
import { Driver } from '../driver/driver.entity';
import { CustodyStatus } from 'src/core/enums/custody-status';
import { mapEmployeeToEmployeeDtoSelective } from '../employee/employee.mapper';
import { mapAccountToAccountDtoSelective } from '../account/account.mapper';
import { mapDriverToDriverDtoSelective } from '../driver/driver.mapper';
import { EmployeeDTO } from '../employee/dtos/employee.dto';
import { AccountDTO } from '../account/dtos/account.dto';
import { JourneyDTO } from '../journey/dtos/journey.dto';
import { DriverDTO } from '../driver/dtos/driver.dto';
import { mapUserToUserDtoSelective } from '../user/user.mapper';
import { UserDTO } from '../user/dtos/user.dto';
import { mapCarToCarDtoSelective } from '../car/car.mapper';
import { CarDTO } from '../car/dtos/car.dto';
import { mapTrailerToTrailerDtoSelective } from '../trailer/trailer.mapper';
import { TrailerDTO } from '../trailer/dtos/trailer.dto';
import { ClientDTO } from '../factory/dtos/client.dto';

const allowedCustodyDtoKeys: ReadonlyArray<keyof CustodyDTO | keyof BaseDTO> = [
  'id',
  'employeeId',
  'accountId',
  'journeyId',
  'driverId',
  'status',
  'custodyAmount',
  'createdBy',
  'updatedBy',
  'createdAt',
  'updatedAt',
];

export function mapCustodyToCustodyDtoSelective(
  custody: Custody,
  keys?: (keyof CustodyDTO | keyof BaseDTO)[],
  includeRelations?: boolean,
): Partial<CustodyDTO>;
export function mapCustodyToCustodyDtoSelective(
  custodies: Custody[],
  keys?: (keyof CustodyDTO | keyof BaseDTO)[],
  includeRelations?: boolean,
): Partial<CustodyDTO>[];
export function mapCustodyToCustodyDtoSelective(
  custodyOrCustodies: Custody | Custody[],
  keys?: (keyof CustodyDTO | keyof BaseDTO)[],
  includeRelations = false,
): Partial<CustodyDTO> | Partial<CustodyDTO>[] {
  const mapSingle = (custody: Custody): Partial<CustodyDTO> => {
    const resultDto: Partial<CustodyDTO> = {};

    const keysToMap = (keys || allowedCustodyDtoKeys).filter((key) =>
      (allowedCustodyDtoKeys as Array<keyof CustodyDTO | keyof BaseDTO>).includes(key),
    );

    keysToMap.forEach((key) => {
      if (key === 'employeeId' && custody.employee?.id !== undefined) {
        resultDto.employeeId = custody.employee.id;
        return;
      }

      if (key === 'accountId' && custody.account?.id !== undefined) {
        resultDto.accountId = custody.account.id;
        return;
      }

      if (key === 'journeyId' && custody.journey?.id !== undefined) {
        resultDto.journeyId = custody.journey.id;
        return;
      }

      if (key === 'driverId' && custody.driver?.id !== undefined) {
        resultDto.driverId = custody.driver.id;
        return;
      }

      if (key in custody && custody[key as keyof Custody] !== undefined) {
        (resultDto as any)[key] = custody[key as keyof Custody];
      }
    });

    if (includeRelations) {
      if (custody.employee) {
        const employeeDto = mapEmployeeToEmployeeDtoSelective(custody.employee, [
          'id',
          'user',
        ]) as EmployeeDTO;
        if (custody.employee.user) {
          employeeDto.user = mapUserToUserDtoSelective(custody.employee.user, [
            'id',
            'firstName',
            'lastName',
            'code',
          ]) as UserDTO;
        }
        resultDto.employee = employeeDto;
      }

      if (custody.account) {
        resultDto.account = mapAccountToAccountDtoSelective(custody.account, [
          'id',
          'code',
          'name',
        ]) as AccountDTO;
      }

      if (custody.journey) {
        const journey = custody.journey;
        const journeyDto: Partial<JourneyDTO> = {
          id: journey.id,
          delegateNumber: journey.delegateNumber,
          delegateDate: journey.delegateDate,
          tripStatus: journey.tripStatus,
          direction: journey.direction,
          quantity: journey.quantity,
          cementGrade: journey.cementGrade,
          packingType: journey.packingType,
          receivedCompany: journey.receivedCompany,
          sellingOrderNo: journey.sellingOrderNo,
        };

        if (journey.driver) {
          const driverDto = mapDriverToDriverDtoSelective(journey.driver, [
            'id',
            'licenseNumber',
            'licenseExpiryDate',
          ]) as DriverDTO;
          if (journey.driver.user) {
            driverDto.user = mapUserToUserDtoSelective(journey.driver.user, [
              'id',
              'firstName',
              'lastName',
              'code',
            ]) as UserDTO;
          }
          journeyDto.driver = driverDto;
        }

        if (journey.assistant) {
          journeyDto.driverAssistant = mapUserToUserDtoSelective(journey.assistant, [
            'id',
            'firstName',
            'lastName',
            'code',
          ]) as UserDTO;
        }

        if (journey.car) {
          journeyDto.car = mapCarToCarDtoSelective(journey.car, [
            'id',
            'code',
            'plateNumber',
            'plateLetters',
          ]) as CarDTO;
        }

        if (journey.trailer) {
          journeyDto.trailer = mapTrailerToTrailerDtoSelective(journey.trailer, [
            'id',
            'code',
            'plateNumber',
            'plateLetters',
          ]) as TrailerDTO;
        }

        if (journey.client) {
          journeyDto.client = { id: journey.client.id, name: journey.client.name } as ClientDTO;
        }

        resultDto.journey = journeyDto as JourneyDTO;
      }

      if (custody.driver) {
        const driverDto = mapDriverToDriverDtoSelective(custody.driver, [
          'id',
          'licenseNumber',
          'licenseExpiryDate',
        ]) as DriverDTO;
        if (custody.driver.user) {
          driverDto.user = mapUserToUserDtoSelective(custody.driver.user, [
            'id',
            'firstName',
            'lastName',
            'code',
          ]) as UserDTO;
        }
        resultDto.driver = driverDto;
      }
    }

    return resultDto;
  };

  return Array.isArray(custodyOrCustodies)
    ? custodyOrCustodies.map(mapSingle)
    : mapSingle(custodyOrCustodies);
}

export const mapCreateCustodyDtoToEntity = async (dto: CreateCustodyDTO): Promise<Custody> => {
  const custody = new Custody();
  custody.createdAt = dto.createdAt;
  custody.status = dto.status ?? CustodyStatus.ACTIVE;

  if (dto.employeeId !== undefined) {
    custody.employee = { id: dto.employeeId } as Employee;
  }

  if (dto.accountId !== undefined) {
    custody.account = { id: dto.accountId } as Account;
  }

  if (dto.journeyId !== undefined) {
    custody.journey = dto.journeyId ? ({ id: dto.journeyId } as Journey) : null;
  }

  if (dto.driverId !== undefined) {
    custody.driver = dto.driverId ? ({ id: dto.driverId } as Driver) : null;
  }

  return custody;
};

export const mapUpdateCustodyDtoToEntity = async (dto: UpdateCustodyDTO): Promise<Custody> => {
  const custody = new Custody();

  if (dto.id !== undefined) custody.id = dto.id;
  if (dto.createdAt !== undefined) custody.createdAt = dto.createdAt;
  if (dto.status !== undefined) custody.status = dto.status;

  if (dto.employeeId !== undefined) {
    custody.employee = { id: dto.employeeId } as Employee;
  }

  if (dto.accountId !== undefined) {
    custody.account = { id: dto.accountId } as Account;
  }

  if (dto.journeyId !== undefined) {
    custody.journey = dto.journeyId ? ({ id: dto.journeyId } as Journey) : null;
  }

  if (dto.driverId !== undefined) {
    custody.driver = dto.driverId ? ({ id: dto.driverId } as Driver) : null;
  }

  return custody;
};
