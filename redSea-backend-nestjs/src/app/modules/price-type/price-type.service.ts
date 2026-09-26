import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, FindOneOptions } from 'typeorm';
import { PriceType } from './price-type.entity';
import { PriceTypeQueryDTO } from './dtos/query-price-type.dto';
import { applyQueryFilters } from 'src/core/utils/query-builder.util';
import { getStringColumns } from 'src/core/utils/entity-meta.util';

@Injectable()
export class PriceTypeService {
  constructor(
    @InjectRepository(PriceType)
    private readonly priceTypeRepository: Repository<PriceType>,
  ) {}

  async findById(id: number): Promise<PriceType | undefined> {
    const result = await this.priceTypeRepository.findOne({ where: { id } });
    return result || undefined;
  }

  async findByFields(options: FindOneOptions<PriceType>): Promise<PriceType | undefined> {
    const result = await this.priceTypeRepository.findOne(options);
    return result || undefined;
  }

  async find(options: FindManyOptions<PriceType>): Promise<PriceType[] | undefined> {
    const result = await this.priceTypeRepository.find(options);
    return result || undefined;
  }

  async findAndCount(
    options: FindManyOptions<PriceType>,
    query?: PriceTypeQueryDTO,
  ): Promise<[PriceType[], number]> {
    if (!query) return this.priceTypeRepository.findAndCount(options);

    const qb = this.priceTypeRepository.createQueryBuilder('priceType');

    if (query.name) {
      qb.andWhere('priceType.name = :exactName', { exactName: query.name });
    }

    applyQueryFilters(qb, query, {
      alias: 'priceType',
      searchableFields: getStringColumns(PriceType),
      enumFilters: [],
      dateFields: ['createdAt', 'updatedAt'],
    });

    return qb.getManyAndCount();
  }

  async save(priceType: PriceType, creator?: string): Promise<PriceType> {
    const now = new Date();

    priceType.createdAt = priceType.createdAt ?? now;
    priceType.updatedAt = now;

    if (creator) {
      priceType.createdBy = priceType.createdBy ?? creator;
      priceType.updatedBy = creator;
    }

    return await this.priceTypeRepository.save(priceType);
  }

  async update(priceType: PriceType, updater?: string): Promise<PriceType> {
    const now = new Date();

    priceType.updatedAt = now;
    if (updater) priceType.updatedBy = updater;

    return await this.priceTypeRepository.save(priceType);
  }

  async delete(id: number): Promise<void> {
    await this.priceTypeRepository.delete(id);
  }
}
