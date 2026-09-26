import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { PhysicalAttachment } from './physical-attachment.entity';
import { QueryPhysicalAttachmentDTO } from './dtos/query-physical-attachment.dto';
import { applyQueryFilters } from 'src/core/utils/query-builder.util';
import { getStringColumns } from 'src/core/utils/entity-meta.util';

@Injectable()
export class PhysicalAttachmentService {
  constructor(
    @InjectRepository(PhysicalAttachment)
    private readonly repo: Repository<PhysicalAttachment>,
  ) {}

  async findById(id: number): Promise<PhysicalAttachment | undefined> {
    return (
      (await this.repo.findOne({
        where: { id },
        relations: ['car', 'trailer'],
      })) ?? undefined
    );
  }

  async findByFields(
    options: FindOneOptions<PhysicalAttachment>,
  ): Promise<PhysicalAttachment | undefined> {
    return (await this.repo.findOne(options)) ?? undefined;
  }

  async find(options: FindManyOptions<PhysicalAttachment>): Promise<PhysicalAttachment[]> {
    return await this.repo.find(options);
  }

  async findAndCount(
    query?: QueryPhysicalAttachmentDTO,
  ): Promise<[PhysicalAttachment[], number]> {
    if (!query) return await this.repo.findAndCount({ relations: ['car', 'trailer'] });

    const qb = this.repo
      .createQueryBuilder('attachment')
      .leftJoinAndSelect('attachment.car', 'car')
      .leftJoinAndSelect('attachment.trailer', 'trailer');

    if (query.carId) {
      qb.andWhere('car.id = :carId', { carId: query.carId });
    }

    if (query.trailerId) {
      qb.andWhere('trailer.id = :trailerId', { trailerId: query.trailerId });
    }

    applyQueryFilters(qb, query, {
      alias: 'attachment',
      searchableFields: getStringColumns(PhysicalAttachment).filter((f) =>
        ['name', 'description', 'photoUrl'].includes(f),
      ),
      dateFields: ['createdAt', 'updatedAt'],
    });

    return qb.getManyAndCount();
  }

  async save(entity: PhysicalAttachment, creator?: string): Promise<PhysicalAttachment> {
    const now = new Date();
    entity.createdAt = entity.createdAt ?? now;
    entity.updatedAt = now;
    if (creator) {
      entity.createdBy = entity.createdBy ?? creator;
      entity.updatedBy = creator;
    }
    return await this.repo.save(entity);
  }

  async update(entity: PhysicalAttachment, updater?: string): Promise<PhysicalAttachment> {
    const now = new Date();
    entity.updatedAt = now;
    if (updater) entity.updatedBy = updater;
    return await this.repo.save(entity);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
