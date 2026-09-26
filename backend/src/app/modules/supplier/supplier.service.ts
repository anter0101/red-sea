import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, FindOneOptions } from 'typeorm';
import { Supplier } from './supplier.entity';
import { generateUniqueCode } from 'src/core/utils/generator';
import { GeneratorTypes } from 'src/core/enums/generator-types';
import { SupplierQueryDTO } from './dtos/query-supplier.dto';
import { applyQueryFilters } from 'src/core/utils/query-builder.util';
import { getStringColumns } from 'src/core/utils/entity-meta.util';

@Injectable()
export class SupplierService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
  ) {}

  // -------------------------------------------------------
  // FIND BY ID
  // -------------------------------------------------------
  async findById(id: number): Promise<Supplier | undefined> {
    const result = await this.supplierRepository.findOne({ where: { id } });
    return result || undefined;
  }

  // -------------------------------------------------------
  // GENERIC FIND ONE
  // -------------------------------------------------------
  async findByFields(options: FindOneOptions<Supplier>): Promise<Supplier | undefined> {
    const result = await this.supplierRepository.findOne(options);
    return result || undefined;
  }

  // -------------------------------------------------------
  // GENERIC FIND MANY
  // -------------------------------------------------------
  async find(options: FindManyOptions<Supplier>): Promise<Supplier[] | undefined> {
    const result = await this.supplierRepository.find(options);
    return result || undefined;
  }

  // -------------------------------------------------------
  // PAGINATED FIND + COUNT
  // -------------------------------------------------------
  async findAndCount(
    options: FindManyOptions<Supplier>,
    query?: SupplierQueryDTO,
  ): Promise<[Supplier[], number]> {
    if (!query) return this.supplierRepository.findAndCount(options);

    const qb = this.supplierRepository.createQueryBuilder('supplier');

    qb.leftJoinAndSelect('supplier.government', 'government');

    applyQueryFilters(qb, query, {
      alias: 'supplier',
      searchableFields: getStringColumns(Supplier),
      enumFilters: ['type'],
      dateFields: ['createdAt', 'updatedAt'],
      relations: [{ alias: 'government', searchableFields: ['name'] }],
    });

    return qb.getManyAndCount();
  }

  // -------------------------------------------------------
  // CREATE
  // -------------------------------------------------------
  async save(supplier: Supplier, creator?: string): Promise<Supplier> {
    const now = new Date();

    supplier.code = await generateUniqueCode(
      this.supplierRepository,
      GeneratorTypes.SUPPLIER,
      'code',
    );

    supplier.createdAt = supplier.createdAt ?? now;
    supplier.updatedAt = now;

    if (creator) {
      supplier.createdBy = supplier.createdBy ?? creator;
      supplier.updatedBy = creator;
    }

    return await this.supplierRepository.save(supplier);
  }

  // -------------------------------------------------------
  // UPDATE
  // -------------------------------------------------------
  async update(supplier: Supplier, updater?: string): Promise<Supplier> {
    const now = new Date();

    supplier.updatedAt = now;
    if (updater) supplier.updatedBy = updater;

    return await this.supplierRepository.save(supplier);
  }

  // -------------------------------------------------------
  // DELETE
  // -------------------------------------------------------
  async delete(id: number): Promise<void> {
    await this.supplierRepository.delete(id);
  }
}
