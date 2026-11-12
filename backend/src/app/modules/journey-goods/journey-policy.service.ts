import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, FindManyOptions, FindOneOptions } from 'typeorm';
import { JourneyPolicy } from './journey-policy.entity';
import { JourneyAttachmentType } from 'src/core/enums/journey';
import { JourneyAttachment } from '../journey-attachment/journey-attachment.entity';
import { JourneyPolicyQueryDTO } from './dtos/query-journey-policy.dto';
import { applyQueryFilters } from 'src/core/utils/query-builder.util';
import { getStringColumns } from 'src/core/utils/entity-meta.util';
import { Journey } from '../journey/journey.entity';
import { Government } from '../government/government.entity';
import { Area } from '../area/area.entity';

@Injectable()
export class JourneyPolicyService {
  constructor(
    @InjectRepository(JourneyPolicy)
    private readonly repo: Repository<JourneyPolicy>,
  ) {}

  async findById(id: number): Promise<JourneyPolicy | undefined> {
    return (await this.repo.findOne({ where: { id } })) ?? undefined;
  }

  async findByFields(options: FindOneOptions<JourneyPolicy>): Promise<JourneyPolicy | undefined> {
    return (await this.repo.findOne(options)) ?? undefined;
  }

  async find(options: FindManyOptions<JourneyPolicy>): Promise<JourneyPolicy[]> {
    return await this.repo.find(options);
  }

  async findAndCount(
    options: FindManyOptions<JourneyPolicy>,
    query?: JourneyPolicyQueryDTO,
  ): Promise<[JourneyPolicy[], number]> {
    if (!query) return await this.repo.findAndCount(options);

    const qb = this.repo
      .createQueryBuilder('policy')
      .leftJoinAndSelect('policy.journey', 'journey')
      .leftJoinAndSelect('policy.deliveryGov', 'deliveryGov')
      .leftJoinAndSelect('policy.deliveryArea', 'deliveryArea')
      .leftJoinAndSelect('policy.employee', 'employee');

    applyQueryFilters(qb, query, {
      alias: 'policy',
      searchableFields: getStringColumns(JourneyPolicy),
      enumFilters: [],
      dateFields: ['createdAt', 'updatedAt'],
      relations: [
        {
          alias: 'journey',
          searchableFields: getStringColumns(Journey),
        },
        {
          alias: 'deliveryGov',
          searchableFields: getStringColumns(Government),
        },
        {
          alias: 'deliveryArea',
          searchableFields: getStringColumns(Area),
        },
      ],
    });

    return qb.getManyAndCount();
  }

  async save(
    entity: JourneyPolicy,
    creator?: string,
    manager?: EntityManager,
  ): Promise<JourneyPolicy> {
    const now = new Date();
    entity.createdAt = entity.createdAt ?? now;
    entity.updatedAt = now;

    if (creator) {
      entity.createdBy = entity.createdBy ?? creator;
      entity.updatedBy = creator;
    }

    const repo = manager ? manager.getRepository(JourneyPolicy) : this.repo;
    return await repo.save(entity);
  }

  async update(
    entity: JourneyPolicy,
    updater?: string,
    manager?: EntityManager,
  ): Promise<JourneyPolicy> {
    const now = new Date();
    entity.updatedAt = now;

    if (updater) entity.updatedBy = updater;

    const repo = manager ? manager.getRepository(JourneyPolicy) : this.repo;
    return await repo.save(entity);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  async getPolicyFormByJourneyId(id: number): Promise<any> {
    const qb = this.repo.createQueryBuilder('policy');

    qb.leftJoin('policy.journey', 'journey')
      .leftJoin('policy.deliveryArea', 'deliveryArea')
      .leftJoin('policy.deliveryGov', 'deliveryGov')
      .leftJoin('policy.employee', 'employee')
      .leftJoin('employee.user', 'employeeUser')
      .leftJoin(
        JourneyAttachment,
        'attachment',
        'attachment.journey_id = journey.id AND attachment.type = :type',
        { type: JourneyAttachmentType.POLICY },
      );

    qb.select([
      // ================= POLICY =================
      `
    jsonb_build_object(
      'id', policy.id,
      'bookWeight', policy."bookWeight",
      'actualWeight', policy."actualWeight",
      'tripDate', policy."tripDate",
      'deliveryWeight', policy."deliveryWeight",
      'shortageQty', policy."shortageQty",
      'policyNo', policy."policyNo",
      'policyDate', policy."policyDate",
      'entryTimeFactory', policy."entryTimeFactory",
      'exitTimeFactory', policy."exitTimeFactory",
      'loadingDate', policy."loadingDate",
      'archiveNo', policy."archiveNo",
      'loadingPermitNo', policy."loadingPermitNo",
      'tripDistance', policy."trip_distance"
    ) AS policyform
    `,

      // ================= DELIVERY AREA =================
      `
    jsonb_build_object(
      'id', "deliveryArea"."id",
      'name', "deliveryArea"."name"
    ) AS "deliveryArea"
    `,

      // ================= DELIVERY GOV =================
      `
    jsonb_build_object(
      'id', "deliveryGov"."id",
      'name', "deliveryGov"."name"
    ) AS "deliveryGov"
    `,

      // ================= EMPLOYEE =================
      `
    jsonb_build_object(
      'id', "employee"."id",
      'name', concat_ws(' ', "employeeUser"."first_name", "employeeUser"."last_name")
    ) AS "employee"
    `,

      // ================= ATTACHMENT =================
      `
    jsonb_agg(
      DISTINCT jsonb_build_object(
        'id', attachment.id,
        'fileName', attachment.url,
        'type', attachment.type
      )
    ) FILTER (WHERE attachment.id IS NOT NULL) AS "attachments"
    `,
    ]);

    qb.where('journey.id = :id', { id });
    qb.groupBy(`
    policy.id,
    journey.id,
    deliveryArea.id,
    deliveryGov.id,
    employee.id,
    employeeUser.id
  `);

    return qb.getRawOne();
  }

  // Detailed view using QueryBuilder with jsonb_build_object, similar style to JourneyService.getJourneyDetailsById
}
