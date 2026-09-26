import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { CarModel } from './car-model.entity';
import { CarModelQueryDTO } from './dtos/query-car-model.dto';
import { applyQueryFilters } from 'src/core/utils/query-builder.util';
import { getStringColumns } from 'src/core/utils/entity-meta.util';
import { CarManufacturer } from '../car-manufacturer/car-manufacturer.entity';

@Injectable()
export class CarModelService {
  constructor(
    @InjectRepository(CarModel)
    private readonly carModelRepo: Repository<CarModel>,
  ) {}

  async findById(id: number): Promise<CarModel | undefined> {
    return (await this.carModelRepo.findOne({ where: { id } })) ?? undefined;
  }

  async find(options: FindManyOptions<CarModel>): Promise<CarModel[]> {
    return await this.carModelRepo.find(options);
  }

  async findAndCount(
    options: FindManyOptions<CarModel>,
    query?: CarModelQueryDTO,
  ): Promise<[CarModel[], number]> {
    if (!query) return await this.carModelRepo.findAndCount(options);

    const qb = this.carModelRepo
      .createQueryBuilder('carModel')
      .leftJoinAndSelect('carModel.manufacturer', 'manufacturer');

    if (query.manufacturerId) {
      qb.andWhere('manufacturer.id = :manufacturerId', { manufacturerId: query.manufacturerId });
    }
    if (query.name) {
      qb.andWhere('carModel.name = :exactName', { exactName: query.name });
    }

    applyQueryFilters(qb, query, {
      alias: 'carModel',
      searchableFields: getStringColumns(CarModel),
      enumFilters: [],
      dateFields: ['createdAt', 'updatedAt'],
      relations: [
        {
          alias: 'manufacturer',
          searchableFields: getStringColumns(CarManufacturer),
        },
      ],
    });

    return qb.getManyAndCount();
  }

  async create(data: Partial<CarModel>, creator?: string): Promise<CarModel> {
    const now = new Date();
    const entity = this.carModelRepo.create({
      ...data,
      createdAt: now,
      updatedAt: now,
      createdBy: creator,
      updatedBy: creator,
    });
    return await this.carModelRepo.save(entity);
  }

  async update(model: CarModel, updater?: string): Promise<CarModel> {
    model.updatedAt = new Date();
    if (updater) model.updatedBy = updater;
    return await this.carModelRepo.save(model);
  }

  async delete(id: number): Promise<void> {
    await this.carModelRepo.delete(id);
  }
}
