import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, IsNull, Repository } from 'typeorm';
import { Car } from './car.entity';
import { CarDTO } from './dtos/car.dto';
import { CarStatsDTO } from './dtos/car-stats.dto';
import { UpdateCarDTO } from './dtos/update-car.dto';
import { generateUniqueCode } from 'src/core/utils/generator';
import { GeneratorTypes } from 'src/core/enums/generator-types';
import { OwnerShipType } from 'src/core/enums/ownerShip-types';
import { VeachleStatus } from 'src/core/enums/veachle-status';
import { CarQueryDTO } from './dtos/query-car.dto';
import { applyQueryFilters } from 'src/core/utils/query-builder.util';
import { getStringColumns } from 'src/core/utils/entity-meta.util';

@Injectable()
export class CarService {
  constructor(
    @InjectRepository(Car)
    private carRepository: Repository<Car>,
  ) {}

  async findById(id: number): Promise<CarDTO | undefined> {
    const result = await this.carRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    return result || undefined;
  }

  async findByFields(options: FindOneOptions<UpdateCarDTO>): Promise<CarDTO | undefined> {
    const where = options.where;
    const result = await this.carRepository.findOne({
      ...(options as FindOneOptions<Car>),
      where: Array.isArray(where)
        ? where.map((w) => ({ ...w, deletedAt: IsNull() }))
        : { ...(where ?? {}), deletedAt: IsNull() },
    });
    return result || undefined;
  }

  async find(options: FindManyOptions<UpdateCarDTO>): Promise<Car | undefined> {
    const where = options.where;
    const result = await this.carRepository.findOne({
      ...(options as FindOneOptions<Car>),
      where: Array.isArray(where)
        ? where.map((w) => ({ ...w, deletedAt: IsNull() }))
        : { ...(where ?? {}), deletedAt: IsNull() },
    });
    return result || undefined;
  }

  async findAndCount(
    options: FindManyOptions<CarDTO>,
    query?: CarQueryDTO,
  ): Promise<[Car[], number]> {
    if (!query) {
      return await this.carRepository.findAndCount({
        ...(options as FindManyOptions<Car>),
        where: {
          ...(options.where ?? {}),
          deletedAt: IsNull(),
        },
      });
    }

    const qb = this.carRepository.createQueryBuilder('car').andWhere('car.deleted_at IS NULL');

    applyQueryFilters(qb, query, {
      alias: 'car',
      searchableFields: getStringColumns(Car),
      enumFilters: ['status', 'ownerShip'],
      dateFields: ['createdAt', 'updatedAt'],
    });

    return qb.getManyAndCount();
  }

  async save(car: Car, creator?: string): Promise<Car> {
    const now = new Date();
    car.code = await generateUniqueCode(this.carRepository, GeneratorTypes.CAR);

    car.createdAt = car.createdAt ?? now;
    car.updatedAt = now;

    if (creator) {
      car.createdBy = car.createdBy ?? creator;
      car.updatedBy = creator;
    }

    return await this.carRepository.save(car);
  }

  async update(car: Car, updater?: string): Promise<Car> {
    const now = new Date();

    if (updater) {
      car.updatedBy = updater;
    }

    car.updatedAt = now;

    return await this.carRepository.save(car);
  }

  async getStats(): Promise<CarStatsDTO> {
    const row = await this.carRepository
      .createQueryBuilder('car')
      .where('car.deleted_at IS NULL')
      .select(`COUNT(car.id) FILTER (WHERE car.status = '${VeachleStatus.ONROAD}')`, 'onRoad')
      .addSelect(
        `COUNT(car.id) FILTER (WHERE car."ownerShip" = '${OwnerShipType.COMPANY_CAR}')`,
        'company',
      )
      .addSelect(`COUNT(car.id) FILTER (WHERE car."ownerShip" = '${OwnerShipType.SHARE}')`, 'share')
      .getRawOne<{ onRoad: string; company: string; share: string }>();

    return {
      onRoad: Number(row?.onRoad ?? 0),
      company: Number(row?.company ?? 0),
      share: Number(row?.share ?? 0),
    };
  }

  async softDelete(id: number, deletedBy?: string): Promise<void> {
    const existing = await this.carRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!existing) {
      throw new NotFoundException(`Car with id ${id} not found`);
    }

    existing.deletedAt = new Date();
    existing.deletedBy = deletedBy;
    existing.updatedAt = new Date();
    if (deletedBy) existing.updatedBy = deletedBy;

    await this.carRepository.save(existing);
  }
}
