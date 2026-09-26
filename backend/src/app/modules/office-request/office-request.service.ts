import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { OfficeRequest } from './office-request.entity';
import { OfficeRequestQueryDTO } from './dtos/query-office-request.dto';
import { applyQueryFilters } from 'src/core/utils/query-builder.util';
import { getStringColumns } from 'src/core/utils/entity-meta.util';
import { Journey } from '../journey/journey.entity';
import { User } from '../user/user.entity';

@Injectable()
export class OfficeRequestService {
  constructor(
    @InjectRepository(OfficeRequest)
    private readonly officeRequestRepository: Repository<OfficeRequest>,
  ) {}

  async findById(id: number): Promise<OfficeRequest | undefined> {
    return (await this.officeRequestRepository.findOne({ where: { id } })) ?? undefined;
  }

  async findByFields(options: FindOneOptions<OfficeRequest>): Promise<OfficeRequest | undefined> {
    return (await this.officeRequestRepository.findOne(options)) ?? undefined;
  }

  async find(options: FindManyOptions<OfficeRequest>): Promise<OfficeRequest[]> {
    return await this.officeRequestRepository.find(options);
  }

  async findAndCount(
    options: FindManyOptions<OfficeRequest>,
    query?: OfficeRequestQueryDTO,
    requestingUserId?: number,
  ): Promise<[OfficeRequest[], number]> {
    if (!query) return await this.officeRequestRepository.findAndCount(options);

    const qb = this.officeRequestRepository
      .createQueryBuilder('officeRequest')
      .leftJoinAndSelect('officeRequest.journey', 'journey')
      .leftJoinAndSelect('officeRequest.requestedFrom', 'requestedFrom')
      .leftJoinAndSelect('requestedFrom.user', 'requestedFromUser')
      .leftJoinAndSelect('officeRequest.requestedTo', 'requestedTo')
      .leftJoinAndSelect('requestedTo.user', 'requestedToUser');

    if (requestingUserId) {
      qb.andWhere('requestedFromUser.id = :requestingUserId', { requestingUserId });
    }

    if (query.journeyId) {
      qb.andWhere('journey.id = :journeyId', { journeyId: query.journeyId });
    }
    if (query.requestedFromId) {
      qb.andWhere('requestedFrom.id = :requestedFromId', {
        requestedFromId: query.requestedFromId,
      });
    }
    if (query.requestedToId) {
      qb.andWhere('requestedTo.id = :requestedToId', { requestedToId: query.requestedToId });
    }

    applyQueryFilters(qb, query, {
      alias: 'officeRequest',
      searchableFields: getStringColumns(OfficeRequest),
      enumFilters: ['status', 'type'],
      dateFields: ['createdAt', 'updatedAt'],
      relations: [
        {
          alias: 'journey',
          searchableFields: getStringColumns(Journey),
        },
        {
          alias: 'requestedFromUser',
          searchableFields: getStringColumns(User),
        },
        {
          alias: 'requestedToUser',
          searchableFields: getStringColumns(User),
        },
      ],
    });

    return qb.getManyAndCount();
  }

  async save(entity: OfficeRequest, creator?: string): Promise<OfficeRequest> {
    const now = new Date();
    entity.createdAt = entity.createdAt ?? now;
    entity.updatedAt = now;
    if (creator) {
      entity.createdBy = entity.createdBy ?? creator;
      entity.updatedBy = creator;
    }
    return await this.officeRequestRepository.save(entity);
  }

  async update(entity: OfficeRequest, updater?: string): Promise<OfficeRequest> {
    const now = new Date();
    entity.updatedAt = now;
    if (updater) entity.updatedBy = updater;
    return await this.officeRequestRepository.save(entity);
  }

  async delete(id: number): Promise<void> {
    await this.officeRequestRepository.delete(id);
  }
}
