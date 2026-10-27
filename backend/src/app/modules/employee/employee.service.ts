import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Employee } from './employee.entity';
import { FindManyOptions, FindOneOptions, Repository, EntityManager } from 'typeorm';
import { EmployeeDTO } from './dtos/employee.dto';
import { generateUniqueCode, generateUniqueUsername } from 'src/core/utils/generator';
import { User } from '../user/user.entity';
import { Branch } from '../branch/branch.entity';
import { EmployeeQueryDTO } from './dtos/query-employee.dto';
import { applyQueryFilters } from 'src/core/utils/query-builder.util';
import { getStringColumns } from 'src/core/utils/entity-meta.util';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findById(id: number): Promise<EmployeeDTO | undefined> {
    const result = await this.employeeRepository.findOne({ where: { id } });
    return result || undefined;
  }

  async findByFields(options: FindOneOptions<Employee>): Promise<Employee | undefined> {
    const result = await this.employeeRepository.findOne(options);
    return result || undefined;
  }

  async find(options: FindOneOptions<Employee>): Promise<Employee | undefined> {
    const result = await this.employeeRepository.findOne(options);
    return result || undefined;
  }

  async findAndCount(
    options: FindManyOptions<Employee>,
    query?: EmployeeQueryDTO,
  ): Promise<[Employee[], number]> {
    if (!query) return await this.employeeRepository.findAndCount(options);

    const qb = this.employeeRepository
      .createQueryBuilder('employee')
      .leftJoinAndSelect('employee.user', 'user')
      .leftJoinAndSelect('user.contacts', 'contacts')
      .leftJoinAndSelect('user.salary', 'salary')
      .leftJoinAndSelect('employee.branch', 'branch');

    if (query.branchId) {
      qb.andWhere('branch.id = :branchId', { branchId: query.branchId });
    }

    applyQueryFilters(qb, query, {
      alias: 'employee',
      searchableFields: getStringColumns(Employee),
      enumFilters: [],
      dateFields: ['createdAt', 'updatedAt'],
      relations: [
        {
          alias: 'user',
          searchableFields: getStringColumns(User),
        },
        {
          alias: 'branch',
          searchableFields: getStringColumns(Branch),
        },
      ],
    });

    return qb.getManyAndCount();
  }

  async save(employee: Employee, creator?: string, manager?: EntityManager): Promise<Employee> {
    const employeeRepository = manager ? manager.getRepository(Employee) : this.employeeRepository;
    const userRepository = manager ? manager.getRepository(User) : this.userRepository;

    // Auto-generate user code if not already assigned
    if (employee.user && !employee.user.code) {
      employee.user.code = await generateUniqueCode(userRepository, employee.user.role);
    }

    if (employee.user) {
      employee.user.username = await generateUniqueUsername(userRepository, employee.user.role);
    }

    // Automatically handle metadata fields
    const now = new Date();
    employee.createdAt = employee.createdAt ?? now;
    employee.updatedAt = now;

    if (creator) {
      employee.createdBy = employee.createdBy ?? creator;
      employee.updatedBy = creator;

      if (employee.user) {
        employee.user.createdBy = employee.user.createdBy ?? creator;
        employee.user.updatedBy = creator;
        employee.user.createdAt = employee.createdAt;
      }
    }

    // Save both employee and nested user
    const savedEmployee = await employeeRepository.save(employee);
    return savedEmployee;
  }

  async update(employee: Employee, updater?: string): Promise<Employee> {
    const now = new Date();

    // Handle updater metadata
    if (updater) {
      employee.updatedBy = updater;
      if (employee.user) employee.user.updatedBy = updater;
    }

    employee.updatedAt = now;
    if (employee.user) employee.user.updatedAt = now;

    const updatedEmployee = await this.employeeRepository.save(employee);
    return updatedEmployee;
  }

  async delete(id: number): Promise<void> {
    await this.employeeRepository.delete(id);
  }
}
