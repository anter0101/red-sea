import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { JourneyTransaction } from './journey-transaction.entity';
import { QueryJourneyTransactionDTO } from './dtos/query-journey-transaction.dto';
import { applyQueryFilters } from 'src/core/utils/query-builder.util';
import { getStringColumns } from 'src/core/utils/entity-meta.util';
import { Journey } from '../journey/journey.entity';

@Injectable()
export class JourneyTransactionService {
  constructor(
    @InjectRepository(JourneyTransaction)
    private readonly repo: Repository<JourneyTransaction>,
  ) {}

  async findById(id: number): Promise<JourneyTransaction | undefined> {
    return (await this.repo.findOne({ where: { id } })) ?? undefined;
  }

  async findByFields(
    options: FindOneOptions<JourneyTransaction>,
  ): Promise<JourneyTransaction | undefined> {
    return (await this.repo.findOne(options)) ?? undefined;
  }

  async find(options: FindManyOptions<JourneyTransaction>): Promise<JourneyTransaction[]> {
    return await this.repo.find(options);
  }

  async findAndCount(
    options: FindManyOptions<JourneyTransaction>,
    query?: QueryJourneyTransactionDTO,
  ): Promise<[JourneyTransaction[], number]> {
    if (!query) return await this.repo.findAndCount(options);

    const qb = this.repo
      .createQueryBuilder('journeyTransaction')
      .leftJoinAndSelect('journeyTransaction.journey', 'journey');

    if (query.journeyId) {
      qb.andWhere('journey.id = :journeyId', { journeyId: query.journeyId });
    }

    applyQueryFilters(qb, query, {
      alias: 'journeyTransaction',
      searchableFields: getStringColumns(JourneyTransaction),
      enumFilters: ['transactionType', 'category'],
      dateFields: ['createdAt', 'updatedAt'],
      relations: [
        {
          alias: 'journey',
          searchableFields: getStringColumns(Journey),
        },
      ],
    });

    return qb.getManyAndCount();
  }

  async save(
    entity: JourneyTransaction,
    creator?: string,
    manager?: EntityManager,
  ): Promise<JourneyTransaction> {
    const repo = manager ? manager.getRepository(JourneyTransaction) : this.repo;
    const now = new Date();
    entity.createdAt = entity.createdAt ?? now;
    entity.updatedAt = now;
    if (creator) {
      entity.createdBy = entity.createdBy ?? creator;
      entity.updatedBy = creator;
    }
    return await repo.save(entity);
  }

  async saveMany(entities: JourneyTransaction[], creator?: string): Promise<JourneyTransaction[]> {
    const now = new Date();
    entities.forEach((entity) => {
      entity.createdAt = entity.createdAt ?? now;
      entity.updatedAt = now;
      if (creator) {
        entity.createdBy = entity.createdBy ?? creator;
        entity.updatedBy = creator;
      }
    });

    return await this.repo.save(entities); // TypeORM supports saving arrays
  }

  async update(entity: JourneyTransaction, updater?: string): Promise<JourneyTransaction> {
    const now = new Date();
    entity.updatedAt = now;
    if (updater) entity.updatedBy = updater;
    return await this.repo.save(entity);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
