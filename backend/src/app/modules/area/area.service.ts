import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, FindOneOptions } from 'typeorm';
import { Area } from './area.entity';
import { AreaQueryDTO } from './dtos/query-area.dto';
import { applyQueryFilters } from 'src/core/utils/query-builder.util';
import { getStringColumns } from 'src/core/utils/entity-meta.util';
import { Government } from '../government/government.entity';

@Injectable()
export class AreaService {
  constructor(
    @InjectRepository(Area)
    private readonly areaRepository: Repository<Area>,
  ) {}

  async findById(id: number): Promise<Area | undefined> {
    const result = await this.areaRepository.findOne({ where: { id } });
    return result || undefined;
  }

  async findByFields(options: FindOneOptions<Area>): Promise<Area | undefined> {
    const result = await this.areaRepository.findOne(options);
    return result || undefined;
  }

  async find(options: FindManyOptions<Area>): Promise<Area[] | undefined> {
    const result = await this.areaRepository.find(options);
    return result || undefined;
  }

  async findAndCount(
    options: FindManyOptions<Area>,
    query?: AreaQueryDTO,
  ): Promise<[Area[], number]> {
    if (!query) return this.areaRepository.findAndCount(options);

    const qb = this.areaRepository
      .createQueryBuilder('area')
      .leftJoinAndSelect('area.government', 'government');

    if (query.governmentId) {
      qb.andWhere('government.id = :governmentId', { governmentId: query.governmentId });
    }

    applyQueryFilters(qb, query, {
      alias: 'area',
      searchableFields: getStringColumns(Area),
      enumFilters: [],
      dateFields: ['createdAt', 'updatedAt'],
      relations: [
        {
          alias: 'government',
          searchableFields: getStringColumns(Government),
        },
      ],
    });

    return qb.getManyAndCount();
  }

  async save(area: Area, creator?: string): Promise<Area> {
    const now = new Date();

    area.createdAt = area.createdAt ?? now;
    area.updatedAt = now;

    if (creator) {
      area.createdBy = area.createdBy ?? creator;
      area.updatedBy = creator;
    }

    return await this.areaRepository.save(area);
  }

  async update(area: Area, updater?: string): Promise<Area> {
    const now = new Date();

    area.updatedAt = now;
    if (updater) area.updatedBy = updater;

    return await this.areaRepository.save(area);
  }

  async delete(id: number): Promise<void> {
    await this.areaRepository.delete(id);
  }
}
