import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, FindOneOptions } from 'typeorm';
import { Government } from './government.entity';
import { GovernmentQueryDTO } from './dtos/query-government.dto';
import { applyQueryFilters } from 'src/core/utils/query-builder.util';
import { getStringColumns } from 'src/core/utils/entity-meta.util';

@Injectable()
export class GovernmentService {
  constructor(
    @InjectRepository(Government)
    private readonly governmentRepository: Repository<Government>,
  ) {}

  async findById(id: number): Promise<Government | undefined> {
    const result = await this.governmentRepository.findOne({ where: { id } });
    return result || undefined;
  }

  async findByFields(options: FindOneOptions<Government>): Promise<Government | undefined> {
    const result = await this.governmentRepository.findOne(options);
    return result || undefined;
  }

  async find(options: FindManyOptions<Government>): Promise<Government[] | undefined> {
    const result = await this.governmentRepository.find(options);
    return result || undefined;
  }

  async findAndCount(
    options: FindManyOptions<Government>,
    query?: GovernmentQueryDTO,
  ): Promise<[Government[], number]> {
    if (!query) return this.governmentRepository.findAndCount(options);

    const qb = this.governmentRepository.createQueryBuilder('government');

    applyQueryFilters(qb, query, {
      alias: 'government',
      searchableFields: getStringColumns(Government),
      enumFilters: [],
      dateFields: ['createdAt', 'updatedAt'],
    });

    return qb.getManyAndCount();
  }

  async save(government: Government, creator?: string): Promise<Government> {
    const now = new Date();

    government.createdAt = government.createdAt ?? now;
    government.updatedAt = now;

    if (creator) {
      government.createdBy = government.createdBy ?? creator;
      government.updatedBy = creator;
    }

    return await this.governmentRepository.save(government);
  }

  async update(government: Government, updater?: string): Promise<Government> {
    const now = new Date();

    government.updatedAt = now;
    if (updater) government.updatedBy = updater;

    return await this.governmentRepository.save(government);
  }

  async delete(id: number): Promise<void> {
    await this.governmentRepository.delete(id);
  }
}
