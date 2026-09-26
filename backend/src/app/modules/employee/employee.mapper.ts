import { mapUserCreateDtoToEntity, mapUserUpdateDtoToEntity } from '../user/user.mapper';
import { Employee } from './employee.entity';
import { CreateEmployeeDTO } from './dtos/create-employee.dto';
import { EmployeeDTO } from './dtos/employee.dto';
import { BaseDTO } from 'src/core/utils/base.dto';
import { UpdateEmployeeDTO } from './dtos/update-employee.dto';
import { Branch } from '../branch/branch.entity';

const allowedEmployeeDtoKeys: ReadonlyArray<keyof EmployeeDTO | keyof BaseDTO> = [
  'id',
  'createdBy',
  'updatedBy',
  'createdAt',
  'updatedAt',
  'user',
];

export function mapEmployeeToEmployeeDtoSelective(
  employee: Employee,
  keys?: (keyof EmployeeDTO | keyof BaseDTO)[],
): Partial<EmployeeDTO>;
export function mapEmployeeToEmployeeDtoSelective(
  employees: Employee[],
  keys?: (keyof EmployeeDTO | keyof BaseDTO)[],
): Partial<EmployeeDTO>[];
export function mapEmployeeToEmployeeDtoSelective(
  employeeOrEmployees: Employee | Employee[],
  keys?: (keyof EmployeeDTO | keyof BaseDTO)[],
): Partial<EmployeeDTO> | Partial<EmployeeDTO>[] {
  const mapSingle = (employee: Employee): Partial<EmployeeDTO> => {
    const resultDto: Partial<EmployeeDTO> = {};

    const keysToMap = (keys || allowedEmployeeDtoKeys).filter((key) =>
      (allowedEmployeeDtoKeys as Array<keyof EmployeeDTO | keyof BaseDTO>).includes(key),
    );

    keysToMap.forEach((key) => {
      if (key in employee && employee[key as keyof Employee] !== undefined) {
        (resultDto as any)[key] = employee[key as keyof Employee];
      }
    });

    return resultDto;
  };

  return Array.isArray(employeeOrEmployees)
    ? employeeOrEmployees.map(mapSingle)
    : mapSingle(employeeOrEmployees);
}

export const mapCreateEmployeeDtoToEntity = async (dto: CreateEmployeeDTO): Promise<Employee> => {
  const employee = new Employee();
  employee.createdAt = dto.createdAt;

  // Map nested user
  employee.user = await mapUserCreateDtoToEntity(dto.user);

  if (dto.branchId !== undefined) {
    const branch = new Branch();
    branch.id = dto.branchId;
    employee.branch = branch;
  }

  return employee;
};

export const mapUpdateEmployeeDtoToEntity = async (dto: UpdateEmployeeDTO): Promise<Employee> => {
  const employee = new Employee();

  if (dto.id !== undefined) employee.id = dto.id;
  if (dto.createdAt !== undefined) employee.createdAt = dto.createdAt;
  if (dto.user !== undefined) employee.user = await mapUserUpdateDtoToEntity(dto.user);
  // Map branch from branchId if provided
  if (dto.branch !== undefined) {
    const branch = new Branch();
    branch.id = dto.branch.id;
    employee.branch = branch;
  }

  return employee;
};
