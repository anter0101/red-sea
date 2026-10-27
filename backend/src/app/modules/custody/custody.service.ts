import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Custody } from './custody.entity';
import { EntityManager, FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { CustodyQueryDTO } from './dtos/query-custody.dto';
import { applyQueryFilters } from 'src/core/utils/query-builder.util';
import { getStringColumns } from 'src/core/utils/entity-meta.util';
import { Employee } from '../employee/employee.entity';
import { Account } from '../account/account.entity';

export interface CustodyListScope {
  employeeUserId?: number;
}

@Injectable()
export class CustodyService {
  constructor(
    @InjectRepository(Custody)
    private custodyRepository: Repository<Custody>,
  ) {}

  async findById(id: number): Promise<Custody | undefined> {
    const result = await this.custodyRepository.findOne({ where: { id } });
    return result || undefined;
  }

  async findByFields(
    options: FindOneOptions<Custody>,
    manager?: EntityManager,
  ): Promise<Custody | undefined> {
    const repo = manager ? manager.getRepository(Custody) : this.custodyRepository;
    const result = await repo.findOne(options);
    return result || undefined;
  }

  async find(options: FindOneOptions<Custody>): Promise<Custody | undefined> {
    const result = await this.custodyRepository.findOne(options);
    return result || undefined;
  }

  async findAndCount(
    options: FindManyOptions<Custody>,
    query?: CustodyQueryDTO,
    scope?: CustodyListScope,
  ): Promise<[Custody[], number]> {
    if (!query) return await this.custodyRepository.findAndCount(options);

    const qb = this.custodyRepository
      .createQueryBuilder('custody')
      .leftJoinAndSelect('custody.employee', 'employee')
      .leftJoinAndSelect('employee.user', 'employeeUser')
      .leftJoinAndSelect('custody.account', 'account')
      .leftJoinAndSelect('custody.journey', 'journey')
      .leftJoinAndSelect('journey.assistant', 'journeyAssistant')
      .leftJoinAndSelect('journey.driver', 'journeyDriver')
      .leftJoinAndSelect('journeyDriver.user', 'journeyDriverUser')
      .leftJoinAndSelect('journey.car', 'journeyCar')
      .leftJoinAndSelect('journey.trailer', 'journeyTrailer')
      .leftJoinAndSelect('journey.client', 'journeyClient')
      .leftJoinAndSelect('custody.driver', 'driver')
      .leftJoinAndSelect('driver.user', 'driverUser');

    if (scope?.employeeUserId) {
      qb.andWhere('employeeUser.id = :scopedEmployeeUserId', {
        scopedEmployeeUserId: scope.employeeUserId,
      });
    } else if (query.employeeId) {
      qb.andWhere('employee.id = :employeeId', { employeeId: query.employeeId });
    }

    if (query.accountId) {
      qb.andWhere('account.id = :accountId', { accountId: query.accountId });
    }

    if (query.journeyId) {
      qb.andWhere('journey.id = :journeyId', { journeyId: query.journeyId });
    }

    if (query.driverId) {
      qb.andWhere('driver.id = :driverId', { driverId: query.driverId });
    }

    applyQueryFilters(qb, query, {
      alias: 'custody',
      searchableFields: getStringColumns(Custody),
      enumFilters: ['status'],
      dateFields: ['createdAt', 'updatedAt'],
      relations: [
        {
          alias: 'employeeUser',
          searchableFields: getStringColumns(Employee),
        },
        {
          alias: 'account',
          searchableFields: getStringColumns(Account),
        },
      ],
    });

    return qb.getManyAndCount();
  }

  async save(custody: Custody, creator?: string, manager?: EntityManager): Promise<Custody> {
    const repo = manager ? manager.getRepository(Custody) : this.custodyRepository;
    const now = new Date();
    custody.createdAt = custody.createdAt ?? now;
    custody.updatedAt = now;

    if (creator) {
      custody.createdBy = custody.createdBy ?? creator;
      custody.updatedBy = creator;
    }

    return repo.save(custody);
  }

  async update(custody: Custody, updater?: string): Promise<Custody> {
    const now = new Date();

    if (updater) {
      custody.updatedBy = updater;
    }

    custody.updatedAt = now;

    return this.custodyRepository.save(custody);
  }

  async delete(id: number): Promise<void> {
    await this.custodyRepository.delete(id);
  }
}
