import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { TireModel } from './tire-model.entity';
import { TireModelQueryDTO } from './dtos/query-tire-model.dto';
import { applyQueryFilters } from 'src/core/utils/query-builder.util';
import { getStringColumns } from 'src/core/utils/entity-meta.util';

@Injectable()
export class TireModelService {
  constructor(
    @InjectRepository(TireModel)
    private readonly tireModelRepo: Repository<TireModel>,
  ) {}

  async findById(id: number): Promise<TireModel | undefined> {
    return (await this.tireModelRepo.findOne({ where: { id } })) ?? undefined;
  }

  async find(options: FindManyOptions<TireModel>): Promise<TireModel[]> {
    return await this.tireModelRepo.find(options);
  }

  async findAndCount(
    options: FindManyOptions<TireModel>,
    query?: TireModelQueryDTO,
  ): Promise<[TireModel[], number]> {
    if (!query) return await this.tireModelRepo.findAndCount(options);

    const qb = this.tireModelRepo.createQueryBuilder('tireModel');

    if (query.name) {
      qb.andWhere('tireModel.name = :exactName', { exactName: query.name });
    }

    applyQueryFilters(qb, query, {
      alias: 'tireModel',
      searchableFields: getStringColumns(TireModel),
      enumFilters: [],
      dateFields: ['createdAt', 'updatedAt'],
    });

    return qb.getManyAndCount();
  }

  async create(data: Partial<TireModel>, creator?: string): Promise<TireModel> {
    const now = new Date();
    const entity = this.tireModelRepo.create({
      ...data,
      createdAt: now,
      updatedAt: now,
      createdBy: creator,
      updatedBy: creator,
    });
    return await this.tireModelRepo.save(entity);
  }

  async update(model: TireModel, updater?: string): Promise<TireModel> {
    model.updatedAt = new Date();
    if (updater) model.updatedBy = updater;
    return await this.tireModelRepo.save(model);
  }

  async delete(id: number): Promise<void> {
    await this.tireModelRepo.delete(id);
  }
}
