import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { JourneyDelegationPrint } from './journey-delegation-print.entity';
import { JourneyDelegationPrintStatus } from 'src/core/enums/journey-delegation-print';
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

    if (record.status === JourneyDelegationPrintStatus.PRINTED) {
      throw new BadRequestException('Delegation for this journey is already marked as printed');
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

  async assertJourneyExists(journeyId: number): Promise<void> {
    const journey = await this.journeyRepository.findOne({ where: { id: journeyId } });
    if (!journey) {
      throw new NotFoundException(`Journey with id ${journeyId} not found`);
    }
  }
}
