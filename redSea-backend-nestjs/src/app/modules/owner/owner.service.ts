// src/owner/owner.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, FindOneOptions, IsNull } from 'typeorm';
import { Owner } from './owner.entity';
import { OwnerQueryDTO } from './dtos/query-owner.dto';
import { applyQueryFilters } from 'src/core/utils/query-builder.util';
import { getStringColumns } from 'src/core/utils/entity-meta.util';

@Injectable()
export class OwnerService {
  constructor(
    @InjectRepository(Owner)
    private ownerRepo: Repository<Owner>,
  ) {}

  async findById(id: number) {
    return this.ownerRepo.findOne({ where: { id, deletedAt: IsNull() } });
  }

  async findOne(options: FindOneOptions<Owner>) {
    const where = options.where as Record<string, unknown> | Record<string, unknown>[] | undefined;
    return this.ownerRepo.findOne({
      ...options,
      where: Array.isArray(where)
        ? where.map((w) => ({ ...w, deletedAt: IsNull() }))
        : ({ ...(where ?? {}), deletedAt: IsNull() } as any),
    });
  }

  async findByFields(options: FindOneOptions<Owner>) {
    return this.findOne(options);
  }

  async findAndCount(
    options: FindManyOptions<Owner>,
    query?: OwnerQueryDTO,
  ): Promise<[Owner[], number]> {
    if (!query) {
      return this.ownerRepo.findAndCount({
        ...options,
        where: {
          ...((options.where as object) ?? {}),
          deletedAt: IsNull(),
        } as any,
      });
    }

    const qb = this.ownerRepo
      .createQueryBuilder('owner')
      .leftJoinAndSelect('owner.carOwnerships', 'carOwnerships')
      .leftJoinAndSelect('carOwnerships.car', 'car')
      .leftJoinAndSelect('owner.trailerOwnerships', 'trailerOwnerships')
      .leftJoinAndSelect('trailerOwnerships.trailer', 'trailer')
      .andWhere('owner.deleted_at IS NULL');

    applyQueryFilters(qb, query, {
      alias: 'owner',
      searchableFields: getStringColumns(Owner),
      enumFilters: ['transactionType'],
      dateFields: ['createdAt', 'updatedAt'],
    });

    return qb.getManyAndCount();
  }

  async save(owner: Owner, creator?: string): Promise<Owner> {
    const now = new Date();
    owner.createdAt = owner.createdAt ?? now;
    owner.updatedAt = now;
    if (creator) {
      owner.createdBy = owner.createdBy ?? creator;
      owner.updatedBy = creator;
    }
    return this.ownerRepo.save(owner); // TypeORM handles cascade!
  }

  async update(owner: Owner, updater?: string): Promise<Owner> {
    const now = new Date();
    if (updater) owner.updatedBy = updater;
    owner.updatedAt = now;
    return this.ownerRepo.save(owner);
  }

  async softDelete(id: number, deletedBy?: string): Promise<void> {
    const existing = await this.ownerRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!existing) {
      throw new NotFoundException(`Owner with id ${id} not found`);
    }

    existing.deletedAt = new Date();
    existing.deletedBy = deletedBy;
    existing.updatedAt = new Date();
    if (deletedBy) existing.updatedBy = deletedBy;

    await this.ownerRepo.save(existing);
  }
}
