import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Warehouse } from './warehouse.entity';
import { Repository, FindManyOptions, FindOneOptions } from 'typeorm';
import { generateUniqueCode } from 'src/core/utils/generator';
import { GeneratorTypes } from 'src/core/enums/generator-types';
import { WarehouseQueryDTO } from './dtos/query-warehouse.dto';
import { applyQueryFilters } from 'src/core/utils/query-builder.util';
import { getStringColumns } from 'src/core/utils/entity-meta.util';
import { Supplier } from '../supplier/supplier.entity';
import { resolveStockStatus } from './warehouse-stock.util';

@Injectable()
export class WarehouseService {
  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
  ) {}

  async findById(id: number): Promise<Warehouse | undefined> {
    const result = await this.warehouseRepository.findOne({
      where: { id },
      relations: ['supplier'],
    });
    return result || undefined;
  }

  async findByFields(options: FindOneOptions<Warehouse>): Promise<Warehouse | undefined> {
    const result = await this.warehouseRepository.findOne({
      ...options,
      relations: options.relations ?? ['supplier'],
    });
    return result || undefined;
  }

  async find(options: FindManyOptions<Warehouse>): Promise<Warehouse[] | undefined> {
    const result = await this.warehouseRepository.find(options);
    return result || undefined;
  }

  async findAndCount(
    options: FindManyOptions<Warehouse>,
    query?: WarehouseQueryDTO,
  ): Promise<[Warehouse[], number]> {
    if (!query) return this.warehouseRepository.findAndCount(options);

    const qb = this.warehouseRepository
      .createQueryBuilder('warehouse')
      .leftJoinAndSelect('warehouse.supplier', 'supplier');

    applyQueryFilters(qb, query, {
      alias: 'warehouse',
      searchableFields: getStringColumns(Warehouse),
      enumFilters: ['status', 'condition'],
      dateFields: ['createdAt', 'updatedAt'],
      relations: [
        {
          alias: 'supplier',
          searchableFields: getStringColumns(Supplier),
        },
      ],
    });

    return qb.getManyAndCount();
  }

  async save(warehouse: Warehouse, creator?: string): Promise<Warehouse> {
    const now = new Date();

    warehouse.code = await generateUniqueCode(
      this.warehouseRepository,
      GeneratorTypes.WAREHOUSE,
      'code',
    );

    warehouse.status = resolveStockStatus(warehouse.status, warehouse.quantity ?? 0);

    warehouse.createdAt = warehouse.createdAt ?? now;
    warehouse.updatedAt = now;

    if (creator) {
      warehouse.createdBy = warehouse.createdBy ?? creator;
      warehouse.updatedBy = creator;
    }

    return await this.warehouseRepository.save(warehouse);
  }

  async update(warehouse: Warehouse, updater?: string): Promise<Warehouse> {
    const now = new Date();

    warehouse.updatedAt = now;
    if (updater) warehouse.updatedBy = updater;

    return await this.warehouseRepository.save(warehouse);
  }

  async delete(id: number): Promise<void> {
    await this.warehouseRepository.delete(id);
  }
}
