import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, FindOneOptions } from 'typeorm';
import { Grids } from './grid.entity';
import { User } from '../user/user.entity';
import { GridsQueryDTO } from './dtos/query-grids.dto';
import { applyQueryFilters } from 'src/core/utils/query-builder.util';
import { getStringColumns } from 'src/core/utils/entity-meta.util';

@Injectable()
export class GridsService {
  constructor(
    @InjectRepository(Grids)
    private readonly gridsRepository: Repository<Grids>,
  ) {}

  async findById(id: number): Promise<Grids | undefined> {
    return (await this.gridsRepository.findOne({ where: { id } })) ?? undefined;
  }

  async findByFields(options: FindOneOptions<Grids>): Promise<Grids | undefined> {
    return (await this.gridsRepository.findOne(options)) ?? undefined;
  }

  async find(options: FindManyOptions<Grids>): Promise<Grids[]> {
    return await this.gridsRepository.find(options);
  }

  async findAndCount(
    options: FindManyOptions<Grids>,
    query?: GridsQueryDTO,
  ): Promise<[Grids[], number]> {
    if (!query) return await this.gridsRepository.findAndCount(options);

    const qb = this.gridsRepository
      .createQueryBuilder('grid')
      .leftJoinAndSelect('grid.user', 'user');

    applyQueryFilters(qb, query, {
      alias: 'grid',
      searchableFields: getStringColumns(Grids),
      enumFilters: [],
      dateFields: ['createdAt', 'updatedAt'],
      relations: [
        {
          alias: 'user',
          searchableFields: getStringColumns(User),
        },
      ],
    });

    return qb.getManyAndCount();
  }

  async save(entity: Grids, creator?: string): Promise<Grids> {
    const now = new Date();
    entity.createdAt = entity.createdAt ?? now;
    entity.updatedAt = now;
    if (creator) {
      entity.createdBy = entity.createdBy ?? creator;
      entity.updatedBy = creator;
    }
    return await this.gridsRepository.save(entity);
  }

  async update(entity: Grids, updater?: string): Promise<Grids> {
    const now = new Date();
    entity.updatedAt = now;
    if (updater) entity.updatedBy = updater;
    return await this.gridsRepository.save(entity);
  }

  async delete(id: number): Promise<void> {
    await this.gridsRepository.delete(id);
  }
}
