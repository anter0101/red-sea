import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Journey } from './journey.entity';
import { JourneyStatusEvent } from './journey-status-event.entity';
import { JourneyStatus, JourneyTransactionCategoryType } from 'src/core/enums/journey';
import { generateUniqueJourneyNumber } from 'src/core/utils/generator';
import { JourneyQueryDTO } from './dtos/query-journey.dto';
import { JourneyStatsDTO } from './dtos/journey-stats.dto';
import { JourneyListScope } from './journey-list-scope.types';
import { buildJourneyCountQuery } from './journey-count-query.builder';
import { buildJourneyListQuery } from './journey-list-query.builder';
import { runJourneyStatsQuery } from './journey-stats.query';

export type { JourneyListScope };

@Injectable()
export class JourneyService {
  constructor(
    @InjectRepository(Journey)
    private readonly journeyRepository: Repository<Journey>,
    @InjectRepository(JourneyStatusEvent)
    private readonly statusEventRepository: Repository<JourneyStatusEvent>,
  ) {}

  async findById(id: number): Promise<Journey | undefined> {
    return (await this.journeyRepository.findOne({ where: { id } })) ?? undefined;
  }

  async findByFields(options: FindOneOptions<Journey>): Promise<Journey | undefined> {
    return (await this.journeyRepository.findOne(options)) ?? undefined;
  }

  async find(options: FindManyOptions<Journey>): Promise<Journey[]> {
    return await this.journeyRepository.find(options);
  }

  async findAndCount(
    query: JourneyQueryDTO,
    page: number,
    pageSize: number,
    sortField?: string,
    sortOrder: 'ASC' | 'DESC' = 'ASC',
    scope?: JourneyListScope,
  ): Promise<[any[], number]> {
    const listQb = this.journeyRepository.createQueryBuilder('journey');
    buildJourneyListQuery(listQb, query, scope, page, pageSize, sortField, sortOrder);
    const results = await listQb.getRawMany();

    const countQb = this.journeyRepository.createQueryBuilder('journey');
    buildJourneyCountQuery(countQb, query, scope);
    const count = await countQb.getCount();

    return [results, count];
  }

  async getStats(query: JourneyQueryDTO, scope?: JourneyListScope): Promise<JourneyStatsDTO> {
    const statsQb = this.journeyRepository.createQueryBuilder('journey');
    return runJourneyStatsQuery(statsQb, query, scope);
  }
  async save(entity: Journey, creator?: string, manager?: EntityManager): Promise<Journey> {
    const repo = manager ? manager.getRepository(Journey) : this.journeyRepository;
    const now = new Date();
    entity.createdAt = entity.createdAt ?? now;
    entity.updatedAt = now;
    entity.delegateDate = entity.delegateDate ?? now;
    entity.tripStatus = JourneyStatus.DELEGATION_ISSUED;

    entity.delegateNumber = await generateUniqueJourneyNumber(repo);

    if (creator) {
      entity.createdBy = entity.createdBy ?? creator;
      entity.updatedBy = creator;
    }
    const saved = await repo.save(entity);
    await this.recordStatusEvent(saved.id, null, saved.tripStatus, creator, manager);
    return saved;
  }

  async transitionStatus(
    journeyId: number,
    toStatus: JourneyStatus,
    changedBy?: string,
    manager?: EntityManager,
  ): Promise<Journey> {
    const repo = manager ? manager.getRepository(Journey) : this.journeyRepository;
    const journey = await repo.findOne({ where: { id: journeyId } });
    if (!journey) {
      throw new Error(`Journey ${journeyId} not found`);
    }
    const fromStatus = journey.tripStatus;
    if (fromStatus === toStatus) {
      return journey;
    }
    journey.tripStatus = toStatus;
    journey.updatedAt = new Date();
    if (changedBy) journey.updatedBy = changedBy;
    const saved = await repo.save(journey);
    await this.recordStatusEvent(journeyId, fromStatus, toStatus, changedBy, manager);
    return saved;
  }

  async getStatusHistory(journeyId: number): Promise<JourneyStatusEvent[]> {
    return this.statusEventRepository.find({
      where: { journey: { id: journeyId } },
      order: { createdAt: 'ASC', id: 'ASC' },
    });
  }

  private async recordStatusEvent(
    journeyId: number,
    fromStatus: JourneyStatus | null | undefined,
    toStatus: JourneyStatus,
    changedBy?: string,
    manager?: EntityManager,
  ): Promise<void> {
    const repo = manager
      ? manager.getRepository(JourneyStatusEvent)
      : this.statusEventRepository;
    const event = repo.create({
      journey: { id: journeyId } as Journey,
      fromStatus: fromStatus ?? undefined,
      toStatus,
      changedBy,
      createdAt: new Date(),
    });
    await repo.save(event);
  }

  async update(entity: Journey, updater?: string, manager?: EntityManager): Promise<Journey> {
    const repo = manager ? manager.getRepository(Journey) : this.journeyRepository;
    const existing = await repo.findOne({ where: { id: entity.id } });
    const now = new Date();
    entity.updatedAt = now;
    if (updater) entity.updatedBy = updater;
    const saved = await repo.save(entity);
    if (existing && existing.tripStatus !== saved.tripStatus) {
      await this.recordStatusEvent(saved.id, existing.tripStatus, saved.tripStatus, updater, manager);
    }
    return saved;
  }

  async delete(id: number): Promise<void> {
    await this.journeyRepository.delete(id);
  }

  async getJourneyEmployees(id: number): Promise<any> {
    const query = this.journeyRepository
      .createQueryBuilder('journey')
      // driver
      .leftJoin('journey.driver', 'driver')
      .innerJoin('driver.user', 'driverUser')
      .leftJoin('driverUser.contacts', 'drivercontact')
      // assistant
      .leftJoin('journey.assistant', 'assistantUser')
      .leftJoin('assistantUser.contacts', 'assistantcontact')
      // transactions (only category = CUSTODY)
      .leftJoin('journey.journeyTransactions', 'trx', 'trx.category = :custodyCategory', {
        custodyCategory: JourneyTransactionCategoryType.CUSTODY,
      })
      .select([
        // journey + transactions
        `jsonb_build_object(
         'id', journey.id,
         'transactions', COALESCE(
           json_agg(DISTINCT jsonb_build_object(
             'id', trx.id,
             'type', trx."transactionType",
             'amount', trx.amount,
             'description', trx.description
           )) FILTER (WHERE trx.id IS NOT NULL),
           '[]'
         )
       ) AS journey`,

        // driver
        `jsonb_build_object(
         'id', driverUser.id,
         'code', driverUser.code,
         'fullName', CONCAT(driverUser.firstName, ' ', driverUser.lastName),
         'personalId', driverUser.personalId,
         'personalIdExpiry', driverUser.personalIdExpiryDate,
         'contacts', COALESCE(
           json_agg(DISTINCT jsonb_build_object('phone', drivercontact.phone , 'id', drivercontact.id))
           FILTER (WHERE drivercontact.id IS NOT NULL),
           '[]'
         )
       ) AS driver`,

        // assistant
        `jsonb_build_object(
         'id', assistantUser.id,
         'code', assistantUser.code,
         'fullName', CONCAT(assistantUser.firstName, ' ', assistantUser.lastName),
         'personalId', assistantUser.personalId,
         'personalIdExpiry', assistantUser.personalIdExpiryDate,
         'contacts', COALESCE(
           json_agg(DISTINCT jsonb_build_object('phone', assistantcontact.phone , 'id', assistantcontact.id))
           FILTER (WHERE assistantcontact.id IS NOT NULL),
           '[]'
         )
       ) AS assistant`,
      ])
      .where('journey.id = :journeyId', { journeyId: id })
      .groupBy('journey.id, driverUser.id, driver.id, assistantUser.id');

    return query.getRawOne();
  }

  async getJourneyVehicles(id: number): Promise<any> {
    const query = this.journeyRepository
      .createQueryBuilder('journey')

      // car
      .leftJoin('journey.car', 'car')

      // trailer
      .leftJoin('journey.trailer', 'trailer')

      // transactions (for fuel)
      .leftJoin('journey.journeyTransactions', 'trx')

      .select([
        // journey object
        `
      jsonb_build_object(
        'id', journey.id,
        'fuelLiters',
          MAX(
            CASE
              WHEN trx.category = '${JourneyTransactionCategoryType.DIESEL_FEES}'
              THEN trx.quantity
            END
          )
      ) AS journey
      `,

        // car object
        `
      jsonb_build_object(
        'id', car.id,
        'plate', CONCAT(car.plateNumber, ' ', car.plateLetters),
        'cylinders', car.cylinders,
        'horsepower', car.horsepower,
        'manufactureYear', car.manufactureYear,
        'manufacturer', car.manufacturer,
        'model', car.model,
        'color', car.color,
        'axleCount', car.axleCount,
        'licenseNumber', car."licenseNumber",
        'fuelConsumptionPer1000km', 0
      ) AS car
      `,

        // trailer object
        `
      jsonb_build_object(
        'id', trailer.id,
        'plate', CONCAT(trailer.plateNumber, ' ', trailer.plateLetters),
        'manufacturer', trailer.manufacturer,
        'color', trailer.color,
        'axleCount', trailer.axleCount,
        'licenseNumber', trailer."licenseNumber"
      ) AS trailer
      `,
      ])
      .where('journey.id = :journeyId', { journeyId: id })
      .groupBy('journey.id, car.id, trailer.id');

    return query.getRawOne();
  }

  async getJourneyInfo(id: number): Promise<any> {
    const qb = this.journeyRepository.createQueryBuilder('journey');

    qb.leftJoin('journey.custodySource', 'custodySource')
      .leftJoin('custodySource.user', 'custodySourceUser')
      .leftJoin('journey.journeyPolicies', 'policy')
      .leftJoin('policy.deliveryGov', 'deliveryGov')
      .leftJoin('policy.deliveryArea', 'deliveryArea')
      .leftJoin('policy.employee', 'policyEmployee')
      .leftJoin('policyEmployee.user', 'policyEmployeeUser');

    qb.select([
      // Journey info (#4567)
      `jsonb_build_object(
      'id', "journey"."id",
      'delegateNumber', "journey"."delegateNumber",
      'packingType', "journey"."packingType",
      'quantity', "journey"."quantity",
      'actualRevenue', "journey"."actualRevenue",
      'cementGrade', "journey"."cementGrade",
      'sellingOrderNo', "journey"."sellingOrderNo",
      'eInvoiceNo', null,
      'totalCost', COALESCE(
        (
          SELECT SUM(trx.amount)
          FROM journey_transactions trx
          WHERE trx.journey_id = "journey"."id"
            AND trx."transactionType" = 'EXPENSE'
        ),
        0
      ),              -- اجمالي التكلفة = مجموع المصروفات
      'dqm', null,                    -- ض. ق. م. (not exists)

      'totalProfit',
        COALESCE("journey"."actualRevenue", 0)
        - COALESCE(
          (
            SELECT SUM(trx.amount)
            FROM journey_transactions trx
            WHERE trx.journey_id = "journey"."id"
              AND trx."transactionType" = 'EXPENSE'
          ),
          0
        ),
      -- إجمالي الربح (not exists)
      'direction', "journey"."direction",
      'receivedCompany', "journey"."receivedCompany",
      'officeEmployee', jsonb_build_object(
        'id', "custodySourceUser"."id",
        'name', CONCAT("custodySourceUser"."first_name", ' ', "custodySourceUser"."last_name")
      )
    ) AS journeyInfo`,

      // Single Policy info (العريش)
      `jsonb_build_object(
      'id', "policy"."id",
      'loadingPermitNo', "policy"."loadingPermitNo",
      'loadingDuration', TO_CHAR("policy"."exitTimeFactory" - "policy"."entryTimeFactory", 'DD "days" HH24:MI:SS'),
      'waitingloading', null,          -- مدة التحميل (not exists)
      'deliveryGov', "deliveryGov"."name",
      'deliveryArea', "deliveryArea"."name",            -- مفوض الاستلام (not exists)
                   -- نوع البضاعة (not exists)
      'bookWeight', "policy"."bookWeight",
      'quantity', "policy"."bookWeight",  -- كمية (طن)
      'tripDistance', "policy"."trip_distance",
      'actualWeight', "policy"."actualWeight",
      'deliveryWeight', "policy"."deliveryWeight",
      'deliveryShortage', "policy"."shortageQty",
      'tripDate', "policy"."tripDate",
      'policyNo', "policy"."policyNo",
      'archiveNo', "policy"."archiveNo",
      'receivingDelegate', CONCAT("policyEmployeeUser"."first_name", ' ', "policyEmployeeUser"."last_name"),
      'receivedAtAdmin', jsonb_build_object(
        'id', "policyEmployeeUser"."id",
        'name', CONCAT("policyEmployeeUser"."first_name", ' ', "policyEmployeeUser"."last_name")
      ),
      'weightLedger', "policy"."bookWeight",      -- الوزن الدفتري
      'weightActual', "policy"."actualWeight",   -- الوزن الفعلي
      'weightDelivered', "policy"."deliveryWeight", -- وزن التسليم
      'revenue', COALESCE("journey"."actualRevenue", 0),                           -- إجمالي الايراد
      'ats', null                                 -- آ. ت. ص. (not exists)
    ) AS policyInfo`,
    ])
      .where('journey.id = :journeyId', { journeyId: id })
      .groupBy(
        'journey.id, policy.id, custodySourceUser.id, policyEmployeeUser.id , deliveryGov.id, deliveryArea.id',
      );

    return qb.getRawOne();
  }

  async getJourneyDetailsById(id: number): Promise<any> {
    const qb = this.journeyRepository.createQueryBuilder('journey');

    qb.leftJoin('journey.driver', 'driver')
      .leftJoin('driver.user', 'driverUser')
      .leftJoin('journey.assistant', 'assistant')
      .leftJoin('journey.car', 'car')
      .leftJoin('journey.trailer', 'trailer')
      .leftJoin('journey.custodySource', 'custodySource')
      .leftJoin('custodySource.user', 'custodySourceUser')
      .leftJoin('journey.journeyPolicies', 'policy')
      .leftJoin('journey.client', 'client')
      .leftJoin('journey.journeyTransactions', 'trx');

    qb
      .select([
        // Journey
        `
    jsonb_build_object(
      'id', journey.id,
      'delegateNumber', journey.delegateNumber,
      'delegateDate', journey.delegateDate,
      'fuelLiters',
        MAX(
          CASE
            WHEN trx.category = '${JourneyTransactionCategoryType.DIESEL_FEES}'
            THEN trx.quantity
          END
        ),
      'tripStatus', journey.tripStatus,
      'receivedCompany', journey.receivedCompany,
      'direction', journey.direction,
      'quantity', journey.quantity,
      'cementGrade', journey.cementGrade,
      'packingType', journey.packingType,
      'sellingOrderNo', journey."sellingOrderNo"
    ) AS journey
    `,

        // Client
        `
    jsonb_build_object(
      'id', client.id,
      'name', client.name,
      'companyCode', client."companyCode"
    ) AS client
    `,

        // Car
        `
    jsonb_build_object(
      'id', car.id,
      'plate', CONCAT(car.plateNumber, ' - ', car.plateLetters),
      'manufacturer', car.manufacturer,
      'model', car.model,
      'ownerShip', car."ownerShip"
    ) AS car
    `,

        // Trailer
        `
    jsonb_build_object(
      'id', trailer.id,
      'plate', CONCAT(trailer.plateNumber, ' - ', trailer.plateLetters),
      'manufacturer', trailer.manufacturer
    ) AS trailer
    `,

        // Driver
        `
    jsonb_build_object(
      'id', driver.id,
      'code', driverUser.code,
      'name', CONCAT(driverUser.first_name, ' ', driverUser.last_name)
    ) AS driver
    `,

        // Assistant
        `
    jsonb_build_object(
      'id', assistant.id,
      'code', assistant.code,
      'name', CONCAT(assistant.first_name, ' ', assistant.last_name)
    ) AS assistant
    `,

        // Custody Source
        `
    jsonb_build_object(
      'id', custodySource.id,
      'name', CONCAT(custodySourceUser.first_name, ' ', custodySourceUser.last_name)
    ) AS custodySource
    `,

        `jsonb_build_object(
          'id',
            MAX(
              CASE
                WHEN trx.category = '${JourneyTransactionCategoryType.CUSTODY}'
                THEN trx.id
              END
            ),
          'transactionType',
            MAX(
              CASE
                WHEN trx.category = '${JourneyTransactionCategoryType.CUSTODY}'
                THEN trx."transactionType"
              END
            ),
          'amount',
            COALESCE(
              MAX(
                CASE
                  WHEN trx.category = '${JourneyTransactionCategoryType.CUSTODY}'
                  THEN trx.amount
                END
              ),
              0
            )
        ) AS journeyTransaction`,

        // Policy
        `
    jsonb_build_object(
      'id', policy.id,
      'policyNo', policy."policyNo",
      'policyDate', policy."policyDate"
    ) AS policy
    `,
      ])
      .where('journey.id = :journeyId', { journeyId: id }).groupBy(`
      journey.id,
      driver.id,
      driverUser.id,
      assistant.id,
      car.id,
      trailer.id,
      custodySource.id,
      custodySourceUser.id,
      client.id,
      policy.id
    `);

    return qb.getRawOne();
  }

  // async totalProfit(): Promise<number> {

  // }

  // async totalExpenses(): Promise<number> {

  // }
}
