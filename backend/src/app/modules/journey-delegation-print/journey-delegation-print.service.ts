import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { JourneyDelegationPrint } from './journey-delegation-print.entity';
import { JourneyDelegationPrintStatus } from 'src/core/enums/journey-delegation-print';
import { JourneyStatus } from 'src/core/enums/journey';
import { Journey } from '../journey/journey.entity';

@Injectable()
export class JourneyDelegationPrintService {
  constructor(
    @InjectRepository(JourneyDelegationPrint)
    private readonly repository: Repository<JourneyDelegationPrint>,
    @InjectRepository(Journey)
    private readonly journeyRepository: Repository<Journey>,
  ) {}

  async findByJourneyId(journeyId: number): Promise<JourneyDelegationPrint | undefined> {
    return (
      (await this.repository.findOne({
        where: { journey: { id: journeyId } },
        relations: ['journey'],
      })) ?? undefined
    );
  }

  async createForJourney(
    journeyId: number,
    manager?: EntityManager,
    creator?: string,
  ): Promise<JourneyDelegationPrint> {
    const repo = manager
      ? manager.getRepository(JourneyDelegationPrint)
      : this.repository;

    const existing = await repo.findOne({ where: { journey: { id: journeyId } } });
    if (existing) {
      return existing;
    }

    const now = new Date();
    const entity = new JourneyDelegationPrint();
    entity.journey = { id: journeyId } as Journey;
    entity.status = JourneyDelegationPrintStatus.NOT_PRINTED;
    entity.createdAt = now;
    entity.updatedAt = now;
    if (creator) {
      entity.createdBy = creator;
      entity.updatedBy = creator;
    }

    return repo.save(entity);
  }

  async markPrinted(journeyId: number, updater?: string): Promise<JourneyDelegationPrint> {
    const record = await this.findByJourneyId(journeyId);
    if (!record) {
      throw new NotFoundException(`Delegation print record for journey ${journeyId} not found`);
    }

    this.assertJourneyHasNoPolicy(record.journey);

    if (record.status === JourneyDelegationPrintStatus.PRINTED) {
      throw new BadRequestException('التفويض مطبوع بالفعل ولا يمكن طلب طباعته مرة أخرى');
    }

    if (record.status !== JourneyDelegationPrintStatus.APPROVED) {
      throw new BadRequestException('طباعة التفويض تحتاج موافقة الإدارة');
    }

    record.status = JourneyDelegationPrintStatus.PRINTED;
    record.updatedAt = new Date();
    if (updater) record.updatedBy = updater;

    const saved = await this.repository.save(record);
    saved.journey = record.journey ?? ({ id: journeyId } as Journey);
    return saved;
  }

  async resetToNotPrinted(journeyId: number, manager?: EntityManager, updater?: string): Promise<void> {
    const repo = manager
      ? manager.getRepository(JourneyDelegationPrint)
      : this.repository;

    const record = await repo.findOne({
      where: { journey: { id: journeyId } },
      relations: ['journey'],
    });

    if (!record) {
      return;
    }

    record.status = JourneyDelegationPrintStatus.NOT_PRINTED;
    record.updatedAt = new Date();
    if (updater) record.updatedBy = updater;

    await repo.save(record);
  }

  async assertPrintRequestAllowed(journeyId: number): Promise<Journey> {
    const journey = await this.journeyRepository.findOne({ where: { id: journeyId } });
    if (!journey) {
      throw new NotFoundException(`Journey with id ${journeyId} not found`);
    }
    this.assertJourneyHasNoPolicy(journey);

    const record = await this.findByJourneyId(journeyId);
    if (record?.status === JourneyDelegationPrintStatus.PRINTED) {
      throw new BadRequestException('التفويض مطبوع بالفعل ولا يمكن طلب طباعته مرة أخرى');
    }
    if (record?.status === JourneyDelegationPrintStatus.APPROVED) {
      throw new BadRequestException('تمت الموافقة على طباعة التفويض بالفعل');
    }
    return journey;
  }

  async grantPrint(journeyId: number, manager?: EntityManager, updater?: string): Promise<void> {
    await this.assertPrintRequestAllowed(journeyId);
    const repo = manager ? manager.getRepository(JourneyDelegationPrint) : this.repository;
    const record =
      (await repo.findOne({ where: { journey: { id: journeyId } }, relations: ['journey'] })) ??
      (await this.createForJourney(journeyId, manager, updater));

    record.status = JourneyDelegationPrintStatus.APPROVED;
    record.updatedAt = new Date();
    if (updater) record.updatedBy = updater;
    await repo.save(record);
  }

  private assertJourneyHasNoPolicy(journey?: Journey): void {
    if (!journey || journey.tripStatus !== JourneyStatus.DELEGATION_ISSUED) {
      throw new BadRequestException('لا يمكن طباعة التفويض بعد تسجيل البوليصة');
    }
  }

  async findUnprintedJourneys(): Promise<
    { journeyId: number; delegateNumber?: string; status: JourneyDelegationPrintStatus }[]
  > {
    const rows = await this.journeyRepository
      .createQueryBuilder('journey')
      .leftJoin(
        JourneyDelegationPrint,
        'delegationPrint',
        'delegationPrint.journey_id = journey.id AND delegationPrint.deleted_at IS NULL',
      )
      .select('journey.id', 'journeyId')
      .addSelect('journey.delegateNumber', 'delegateNumber')
      .where('journey.deleted_at IS NULL')
      .andWhere('journey.tripStatus = :issued', { issued: JourneyStatus.DELEGATION_ISSUED })
      .andWhere('(delegationPrint.status IS NULL OR delegationPrint.status = :notPrinted)', {
        notPrinted: JourneyDelegationPrintStatus.NOT_PRINTED,
      })
      .orderBy('journey.id', 'DESC')
      .getRawMany<{ journeyId: string | number; delegateNumber: string | null }>();

    return rows.map((row) => ({
      journeyId: Number(row.journeyId),
      delegateNumber: row.delegateNumber ?? undefined,
      status: JourneyDelegationPrintStatus.NOT_PRINTED,
    }));
  }

  async assertJourneyExists(journeyId: number): Promise<void> {
    const journey = await this.journeyRepository.findOne({ where: { id: journeyId } });
    if (!journey) {
      throw new NotFoundException(`Journey with id ${journeyId} not found`);
    }
  }
}
