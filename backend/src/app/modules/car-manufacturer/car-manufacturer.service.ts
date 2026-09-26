// src/car-manufacturer/car-manufacturer.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, FindOneOptions } from 'typeorm';

import { CarManufacturer } from './car-manufacturer.entity';
import { CarManufacturerQueryDTO } from './dtos/query-car-manufacturer.dto';
import { applyQueryFilters } from 'src/core/utils/query-builder.util';
import { getStringColumns } from 'src/core/utils/entity-meta.util';

@Injectable()
export class CarManufacturerService {
  constructor(
    @InjectRepository(CarManufacturer)
    private readonly manufacturerRepository: Repository<CarManufacturer>,
  ) {}

  // ------------------------------------------------------------------------
  // FIND BY ID
  // ------------------------------------------------------------------------
  async findById(id: number): Promise<CarManufacturer | undefined> {
    const result = await this.manufacturerRepository.findOne({ where: { id } });
    return result ?? undefined;
  }

  // ------------------------------------------------------------------------
  // FIND BY FIELDS (Where)
  // ------------------------------------------------------------------------
  async findByFields(
    options: FindOneOptions<CarManufacturer>,
  ): Promise<CarManufacturer | undefined> {
    const result = await this.manufacturerRepository.findOne(options);
    return result ?? undefined;
  }

  // ------------------------------------------------------------------------
  // FIND LIST
  // ------------------------------------------------------------------------
  async find(options: FindManyOptions<CarManufacturer>): Promise<CarManufacturer[]> {
    return this.manufacturerRepository.find(options);
  }

  // ------------------------------------------------------------------------
  // FIND & COUNT (pagination)
  // ------------------------------------------------------------------------
  async findAndCount(
    options: FindManyOptions<CarManufacturer>,
    query?: CarManufacturerQueryDTO,
  ): Promise<[CarManufacturer[], number]> {
    if (!query) return this.manufacturerRepository.findAndCount(options);

    const qb = this.manufacturerRepository.createQueryBuilder('carManufacturer');

    applyQueryFilters(qb, query, {
      alias: 'carManufacturer',
      searchableFields: getStringColumns(CarManufacturer),
      enumFilters: [],
      dateFields: ['createdAt', 'updatedAt'],
    });

    return qb.getManyAndCount();
  }

  // ------------------------------------------------------------------------
  // CREATE
  // ------------------------------------------------------------------------
  async save(entity: CarManufacturer, creator?: string): Promise<CarManufacturer> {
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
  async update(entity: CarManufacturer, updater?: string): Promise<CarManufacturer> {
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
