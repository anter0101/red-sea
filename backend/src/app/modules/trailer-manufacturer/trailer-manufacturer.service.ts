import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, FindOneOptions } from 'typeorm';

import { TrailerManufacturer } from './trailer-manufacturer.entity';
import { TrailerManufacturerQueryDTO } from './dtos/query-trailer-manufacturer.dto';
import { applyQueryFilters } from 'src/core/utils/query-builder.util';
import { getStringColumns } from 'src/core/utils/entity-meta.util';

@Injectable()
export class TrailerManufacturerService {
  constructor(
    @InjectRepository(TrailerManufacturer)
    private readonly manufacturerRepository: Repository<TrailerManufacturer>,
  ) {}

  // ------------------------------------------------------------------------
  // FIND BY ID
  // ------------------------------------------------------------------------
  async findById(id: number): Promise<TrailerManufacturer | undefined> {
    const result = await this.manufacturerRepository.findOne({ where: { id } });
    return result ?? undefined;
  }

  // ------------------------------------------------------------------------
  // FIND BY FIELDS (Where)
  // ------------------------------------------------------------------------
  async findByFields(
    options: FindOneOptions<TrailerManufacturer>,
  ): Promise<TrailerManufacturer | undefined> {
    const result = await this.manufacturerRepository.findOne(options);
    return result ?? undefined;
  }

  // ------------------------------------------------------------------------
  // FIND LIST
  // ------------------------------------------------------------------------
  async find(options: FindManyOptions<TrailerManufacturer>): Promise<TrailerManufacturer[]> {
    return this.manufacturerRepository.find(options);
  }

  // ------------------------------------------------------------------------
  // FIND & COUNT (pagination)
  // ------------------------------------------------------------------------
  async findAndCount(
    options: FindManyOptions<TrailerManufacturer>,
    query?: TrailerManufacturerQueryDTO,
  ): Promise<[TrailerManufacturer[], number]> {
    if (!query) return this.manufacturerRepository.findAndCount(options);

    const qb = this.manufacturerRepository.createQueryBuilder('trailerManufacturer');

    applyQueryFilters(qb, query, {
      alias: 'trailerManufacturer',
      searchableFields: getStringColumns(TrailerManufacturer),
      enumFilters: [],
      dateFields: ['createdAt', 'updatedAt'],
    });

    return qb.getManyAndCount();
  }

  // ------------------------------------------------------------------------
  // CREATE
  // ------------------------------------------------------------------------
  async save(entity: TrailerManufacturer, creator?: string): Promise<TrailerManufacturer> {
    const now = new Date();

    entity.createdAt = entity.createdAt ?? now;
    entity.updatedAt = now;

    if (creator) {
      entity.createdBy = entity.createdBy ?? creator;
      entity.updatedBy = creator;
    }

    return await this.manufacturerRepository.save(entity);
  }

  // ------------------------------------------------------------------------
  // UPDATE
  // ------------------------------------------------------------------------
  async update(entity: TrailerManufacturer, updater?: string): Promise<TrailerManufacturer> {
    const now = new Date();

    entity.updatedAt = now;
    if (updater) entity.updatedBy = updater;

    return await this.manufacturerRepository.save(entity);
  }

  // ------------------------------------------------------------------------
  // DELETE
  // ------------------------------------------------------------------------
  async delete(id: number): Promise<void> {
    await this.manufacturerRepository.delete(id);
  }
}
