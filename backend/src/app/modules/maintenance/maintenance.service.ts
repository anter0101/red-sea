import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Maintenance } from './maintenance.entity';
import { QueryMaintenanceDTO } from './dtos/query-maintenance.dto';
import { applyQueryFilters } from 'src/core/utils/query-builder.util';
import { getStringColumns } from 'src/core/utils/entity-meta.util';

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectRepository(Maintenance)
    private readonly repo: Repository<Maintenance>,
  ) {}

  async findById(id: number): Promise<Maintenance | undefined> {
    return (
      (await this.repo.findOne({
        where: { id },
        relations: ['car', 'trailer'],
      })) ?? undefined
    );
  }

  async findByFields(options: FindOneOptions<Maintenance>): Promise<Maintenance | undefined> {
    return (await this.repo.findOne(options)) ?? undefined;
  }

  async find(options: FindManyOptions<Maintenance>): Promise<Maintenance[]> {
    return await this.repo.find(options);
  }

  async findAndCount(query?: QueryMaintenanceDTO): Promise<[Maintenance[], number]> {
    if (!query) return await this.repo.findAndCount({ relations: ['car', 'trailer'] });

    const qb = this.repo
      .createQueryBuilder('maintenance')
      .leftJoinAndSelect('maintenance.car', 'car')
      .leftJoinAndSelect('maintenance.trailer', 'trailer')
      .andWhere('maintenance.deleted_at IS NULL');

    if (query.carId) {
      qb.andWhere('car.id = :carId', { carId: query.carId });
    }
    if (query.trailerId) {
      qb.andWhere('trailer.id = :trailerId', { trailerId: query.trailerId });
    }

    applyQueryFilters(qb, query, {
      alias: 'maintenance',
      searchableFields: getStringColumns(Maintenance).filter((f) =>
        ['description', 'notes'].includes(f),
      ),
      dateFields: ['createdAt', 'updatedAt', 'maintenanceDate'],
    });

    return qb.getManyAndCount();
  }

  async save(entity: Maintenance, creator?: string): Promise<Maintenance> {
    const now = new Date();
    entity.createdAt = entity.createdAt ?? now;
    entity.updatedAt = now;
    if (creator) {
      entity.createdBy = entity.createdBy ?? creator;
      entity.updatedBy = creator;
    }
    return await this.repo.save(entity);
  }

  async update(entity: Maintenance, updater?: string): Promise<Maintenance> {
    const now = new Date();
    entity.updatedAt = now;
    if (updater) entity.updatedBy = updater;
    return await this.repo.save(entity);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
