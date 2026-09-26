import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, FindOneOptions } from 'typeorm';
import { GpsTail } from './gps-tail.entity';
import { GpsTailQueryDTO } from './dtos/query-gps-tail.dto';
import { applyQueryFilters } from 'src/core/utils/query-builder.util';
import { getStringColumns } from 'src/core/utils/entity-meta.util';
import { GpsDevice } from '../gps-device/gps-device.entity';

@Injectable()
export class GpsTailService {
  constructor(
    @InjectRepository(GpsTail)
    private readonly gpsTailRepository: Repository<GpsTail>,
  ) {}

  async findById(id: number): Promise<GpsTail | undefined> {
    const result = await this.gpsTailRepository.findOne({ where: { id } });
    return result || undefined;
  }

  async findByFields(options: FindOneOptions<GpsTail>): Promise<GpsTail | undefined> {
    const result = await this.gpsTailRepository.findOne(options);
    return result || undefined;
  }

  async find(options: FindManyOptions<GpsTail>): Promise<GpsTail[] | undefined> {
    const result = await this.gpsTailRepository.find(options);
    return result || undefined;
  }

  async findAndCount(
    options: FindManyOptions<GpsTail>,
    query?: GpsTailQueryDTO,
  ): Promise<[GpsTail[], number]> {
    if (!query) return this.gpsTailRepository.findAndCount(options);

    const qb = this.gpsTailRepository
      .createQueryBuilder('gpsTail')
      .leftJoinAndSelect('gpsTail.gpsDevice', 'gpsDevice');

    if (query.gpsDeviceId) {
      qb.andWhere('gpsDevice.id = :gpsDeviceId', { gpsDeviceId: query.gpsDeviceId });
    }

    applyQueryFilters(qb, query, {
      alias: 'gpsTail',
      searchableFields: getStringColumns(GpsTail),
      enumFilters: [],
      dateFields: ['createdAt', 'updatedAt'],
      relations: [
        {
          alias: 'gpsDevice',
          searchableFields: getStringColumns(GpsDevice),
        },
      ],
    });

    return qb.getManyAndCount();
  }

  async save(tail: GpsTail, creator?: string): Promise<GpsTail> {
    const now = new Date();
    tail.createdAt = tail.createdAt ?? now;
    tail.updatedAt = now;
    if (creator) {
      tail.createdBy = tail.createdBy ?? creator;
      tail.updatedBy = creator;
    }
    return await this.gpsTailRepository.save(tail);
  }

  async update(tail: GpsTail, updater?: string): Promise<GpsTail> {
    const now = new Date();
    tail.updatedAt = now;
    if (updater) tail.updatedBy = updater;
    return await this.gpsTailRepository.save(tail);
  }

  async delete(id: number): Promise<void> {
    await this.gpsTailRepository.delete(id);
  }
}
