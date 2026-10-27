import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { JourneyAttachment } from './journey-attachment.entity';
import { JourneyAttachmentQueryDTO } from './dtos/query-journey-attachment.dto';
import { applyQueryFilters } from 'src/core/utils/query-builder.util';
import { getStringColumns } from 'src/core/utils/entity-meta.util';

@Injectable()
export class JourneyAttachmentService {
  constructor(
    @InjectRepository(JourneyAttachment)
    private readonly repo: Repository<JourneyAttachment>,
  ) {}

  async findById(id: number): Promise<JourneyAttachment | undefined> {
    return (await this.repo.findOne({ where: { id } })) ?? undefined;
  }

  async findByFields(
    options: FindOneOptions<JourneyAttachment>,
  ): Promise<JourneyAttachment | undefined> {
    return (await this.repo.findOne(options)) ?? undefined;
  }

  async find(options: FindManyOptions<JourneyAttachment>): Promise<JourneyAttachment[]> {
    return await this.repo.find(options);
  }

  async findAndCount(query?: JourneyAttachmentQueryDTO): Promise<[JourneyAttachment[], number]> {
    if (!query) return await this.repo.findAndCount();

    const qb = this.repo
      .createQueryBuilder('attachment')
      .leftJoinAndSelect('attachment.journey', 'journey');

    if (query.journeyId) {
      qb.andWhere('journey.id = :journeyId', { journeyId: query.journeyId });
    }

    applyQueryFilters(qb, query, {
      alias: 'attachment',
      searchableFields: getStringColumns(JourneyAttachment),
      enumFilters: ['type'],
      dateFields: ['createdAt', 'updatedAt'],
    });

    return qb.getManyAndCount();
  }

  async save(entity: JourneyAttachment, creator?: string): Promise<JourneyAttachment> {
    const now = new Date();
    entity.createdAt = entity.createdAt ?? now;
    entity.updatedAt = now;
    if (creator) {
      entity.createdBy = entity.createdBy ?? creator;
      entity.updatedBy = creator;
    }
    return await this.repo.save(entity);
  }

  async update(entity: JourneyAttachment, updater?: string): Promise<JourneyAttachment> {
    const now = new Date();
    entity.updatedAt = now;
    if (updater) entity.updatedBy = updater;
    return await this.repo.save(entity);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
