import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, IsNull, Repository } from 'typeorm';
import { Trailer } from './trailer.entity';
import { TrailerStatsDTO } from './dtos/trailer-stats.dto';
import { generateUniqueCode } from 'src/core/utils/generator';
import { GeneratorTypes } from 'src/core/enums/generator-types';
import { OwnerShipType } from 'src/core/enums/ownerShip-types';
import { VeachleStatus } from 'src/core/enums/veachle-status';
import { QueryTrailerDto } from './dtos/query-trailer.dto';
import { applyQueryFilters } from 'src/core/utils/query-builder.util';
import { getStringColumns } from 'src/core/utils/entity-meta.util';

@Injectable()
export class TrailerService {
  constructor(
    @InjectRepository(Trailer)
    private trailerRepository: Repository<Trailer>,
  ) {}

  async findById(id: number): Promise<Trailer | undefined> {
    const result = await this.trailerRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    return result || undefined;
  }

  async findByFields(options: FindOneOptions<Trailer>): Promise<Trailer | undefined> {
    const where = options.where as Record<string, unknown> | Record<string, unknown>[] | undefined;
    const result = await this.trailerRepository.findOne({
      ...options,
      where: Array.isArray(where)
        ? where.map((w) => ({ ...w, deletedAt: IsNull() }))
        : ({ ...(where ?? {}), deletedAt: IsNull() } as any),
    });
    return result || undefined;
  }

  async find(options: FindManyOptions<Trailer>): Promise<Trailer | undefined> {
    const where = options.where as Record<string, unknown> | Record<string, unknown>[] | undefined;
    const result = await this.trailerRepository.findOne({
      ...options,
      where: Array.isArray(where)
        ? where.map((w) => ({ ...w, deletedAt: IsNull() }))
        : ({ ...(where ?? {}), deletedAt: IsNull() } as any),
    });
    return result || undefined;
  }

  async findAndCount(
    options: FindManyOptions<Trailer>,
    query?: QueryTrailerDto,
  ): Promise<[Trailer[], number]> {
    if (!query) {
      return await this.trailerRepository.findAndCount({
        ...options,
        where: {
          ...((options.where as object) ?? {}),
          deletedAt: IsNull(),
        } as any,
      });
    }

    const qb = this.trailerRepository
      .createQueryBuilder('trailer')
      .andWhere('trailer.deleted_at IS NULL');

    applyQueryFilters(qb, query, {
      alias: 'trailer',
      searchableFields: getStringColumns(Trailer),
      enumFilters: ['status', 'ownerShip'],
      dateFields: ['createdAt', 'updatedAt'],
    });

    return qb.getManyAndCount();
  }

  async save(trailer: Trailer, creator?: string): Promise<Trailer> {
    const now = new Date();

    trailer.code = await generateUniqueCode(this.trailerRepository, GeneratorTypes.TRAILER);

    trailer.createdAt = trailer.createdAt ?? now;
    trailer.updatedAt = now;

    if (creator) {
      trailer.createdBy = trailer.createdBy ?? creator;
      trailer.updatedBy = creator;
    }

    return await this.trailerRepository.save(trailer);
  }

  async update(trailer: Trailer, updater?: string): Promise<Trailer> {
    const now = new Date();

    if (updater) {
      trailer.updatedBy = updater;
    }

    trailer.updatedAt = now;

    return await this.trailerRepository.save(trailer);
  }

  async getStats(): Promise<TrailerStatsDTO> {
    const row = await this.trailerRepository
      .createQueryBuilder('trailer')
      .where('trailer.deleted_at IS NULL')
      .select(
        `COUNT(trailer.id) FILTER (WHERE trailer.status = '${VeachleStatus.ONROAD}')`,
        'onRoad',
      )
      .addSelect(
        `COUNT(trailer.id) FILTER (WHERE trailer."ownerShip" = '${OwnerShipType.COMPANY_CAR}')`,
        'company',
      )
      .addSelect(
        `COUNT(trailer.id) FILTER (WHERE trailer."ownerShip" = '${OwnerShipType.SHARE}')`,
        'share',
      )
      .addSelect(
        `COUNT(trailer.id) FILTER (WHERE trailer."ownerShip" = '${OwnerShipType.NOLON_CAR}')`,
        'nolon',
      )
      .getRawOne<{ onRoad: string; company: string; share: string; nolon: string }>();

    return {
      onRoad: Number(row?.onRoad ?? 0),
      company: Number(row?.company ?? 0),
      share: Number(row?.share ?? 0),
      nolon: Number(row?.nolon ?? 0),
    };
  }

  async softDelete(id: number, deletedBy?: string): Promise<void> {
    const existing = await this.trailerRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!existing) {
      throw new NotFoundException(`Trailer with id ${id} not found`);
    }

    existing.deletedAt = new Date();
    existing.deletedBy = deletedBy;
    existing.updatedAt = new Date();
    if (deletedBy) existing.updatedBy = deletedBy;

    await this.trailerRepository.save(existing);
  }
}
