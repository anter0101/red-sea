import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { DeliveryPrice } from '../delivery-price/delivery-price.entity';
import { Journey } from './journey.entity';
import { JourneyPolicy } from '../journey-goods/journey-policy.entity';
import { JourneyTransaction } from '../journey-transaction/journey-transaction.entity';
import { PricingSheetKind } from 'src/core/enums/pricing-sheet-kind';
import { OwnerShipType } from 'src/core/enums/ownerShip-types';
import { SalaryType } from 'src/core/enums/salary';
import {
  JourneyTransactionCategoryType,
  JourneyTransactionType,
} from 'src/core/enums/journey';
import {
  actualRevenueFrom,
  expectedRevenueFrom,
  nolonExpenseRemainder,
  unitPriceFromSheet,
} from './journey-revenue.calculator';

@Injectable()
export class JourneyRevenueService {
  constructor(
    @InjectRepository(DeliveryPrice)
    private readonly deliveryPriceRepository: Repository<DeliveryPrice>,
    @InjectRepository(Journey)
    private readonly journeyRepository: Repository<Journey>,
    @InjectRepository(JourneyPolicy)
    private readonly policyRepository: Repository<JourneyPolicy>,
    @InjectRepository(JourneyTransaction)
    private readonly transactionRepository: Repository<JourneyTransaction>,
  ) {}

  async applyExpected(
    journeyId: number,
    areaId: number,
    onDate?: Date | string | null,
    updater?: string,
    manager?: EntityManager,
  ): Promise<DeliveryPrice | null> {
    const journeyRepo = manager ? manager.getRepository(Journey) : this.journeyRepository;
    const priceRepo = manager
      ? manager.getRepository(DeliveryPrice)
      : this.deliveryPriceRepository;

    const journey = await journeyRepo.findOne({
      where: { id: journeyId },
      relations: ['client'],
    });
    if (!journey?.client?.id) return null;

    const row = await this.resolveSheetRow(
      priceRepo,
      journey,
      areaId,
      onDate ?? new Date(),
    );
    if (!row) return null;

    const kind = journey.client.pricingSheetKind ?? PricingSheetKind.ARISH;
    const unit = unitPriceFromSheet(row, kind);
    journey.expectedRevenue = expectedRevenueFrom(unit, journey.quantity) ?? undefined;
    journey.updatedAt = new Date();
    if (updater) journey.updatedBy = updater;
    await journeyRepo.save(journey);
    return row;
  }

  async applyExpectedForJourney(
    journeyId: number,
    areaId?: number | null,
    updater?: string,
    manager?: EntityManager,
  ): Promise<void> {
    const resolvedAreaId = areaId ?? (await this.latestPolicyAreaId(journeyId, manager));
    if (!resolvedAreaId) return;
    await this.applyExpected(journeyId, resolvedAreaId, new Date(), updater, manager);
  }

  async applyFromPolicy(
    policy: JourneyPolicy,
    updater?: string,
    manager?: EntityManager,
  ): Promise<void> {
    const journeyRepo = manager ? manager.getRepository(Journey) : this.journeyRepository;

    const journeyId = policy.journey?.id;
    if (!journeyId) return;

    const areaId = policy.deliveryArea?.id;
    if (!areaId) return;

    const date = policy.tripDate ?? policy.policyDate ?? new Date();
    const row = await this.applyExpected(journeyId, areaId, date, updater, manager);
    if (!row) return;

    const journey = await journeyRepo.findOne({
      where: { id: journeyId },
      relations: [
        'client',
        'car',
        'assistant',
        'assistant.salary',
        'driver',
        'driver.user',
        'driver.user.salary',
      ],
    });
    if (!journey) return;

    const kind = journey.client?.pricingSheetKind ?? PricingSheetKind.ARISH;
    const unit = unitPriceFromSheet(row, kind);
    journey.actualRevenue = actualRevenueFrom(unit, policy.bookWeight) ?? undefined;
    journey.updatedAt = new Date();
    if (updater) journey.updatedBy = updater;
    await journeyRepo.save(journey);

    const ownerShip = journey.car?.ownerShip;
    const nolonAlreadyPostedAsFees =
      ownerShip === OwnerShipType.NOLON_CAR || ownerShip === OwnerShipType.CONTRACT_CAR;

    if (nolonAlreadyPostedAsFees) {
      const sheetNolon = Number(row.nolonPrice ?? 0);
      const custodyGiven = await this.custodyAlreadyGiven(journeyId, manager);
      const nolon = nolonExpenseRemainder(sheetNolon, custodyGiven);
      if (sheetNolon > 0) {
        await this.upsertExpense(
          journeyId,
          JourneyTransactionCategoryType.NOLON_FEES,
          nolon,
          'نولون',
          updater,
          manager,
        );
      }
    }

    await this.applySalarySchemeExpenses({
      journeyId,
      salary: journey.driver?.user?.salary,
      sheetNolon: Number(row.nolonPrice ?? 0),
      nolonAlreadyPostedAsFees,
      role: 'driver',
      updater,
      manager,
    });

    if (journey.assistant) {
      await this.applySalarySchemeExpenses({
        journeyId,
        salary: journey.assistant.salary,
        sheetNolon: Number(row.nolonPrice ?? 0),
        nolonAlreadyPostedAsFees,
        role: 'assistant',
        updater,
        manager,
      });
    }
  }

  private async applySalarySchemeExpenses(args: {
    journeyId: number;
    salary:
      | {
          salaryType?: SalaryType | string | null;
          dailyWorkPrice?: number | string | null;
        }
      | null
      | undefined;
    sheetNolon: number;
    nolonAlreadyPostedAsFees: boolean;
    role: 'driver' | 'assistant';
    updater?: string;
    manager?: EntityManager;
  }): Promise<void> {
    const { journeyId, salary, sheetNolon, nolonAlreadyPostedAsFees, role, updater, manager } =
      args;
    if (!salary?.salaryType) return;

    const type = salary.salaryType as SalaryType;
    const dailyCat =
      role === 'driver'
        ? JourneyTransactionCategoryType.DRIVER_DAILY_WORK
        : JourneyTransactionCategoryType.ASSISTANT_DAILY_WORK;
    const commissionCat =
      role === 'driver'
        ? JourneyTransactionCategoryType.DRIVER_COMMISSION
        : JourneyTransactionCategoryType.ASSISTANT_COMMISSION;
    const dailyLabel = role === 'driver' ? 'يوم عمل السائق' : 'يوم عمل التابع';
    const commissionLabel = role === 'driver' ? 'عمولة/نولون الشيت' : 'عمولة/نولون الشيت (تابع)';

    const postDaily =
      type === SalaryType.MONTHLY || type === SalaryType.COMMISSION;
    const postSheetNolon =
      type === SalaryType.MONTHLY ||
      type === SalaryType.COMMISSION ||
      type === SalaryType.NOLON_PERCENT;

    if (postDaily) {
      const daily = Number(salary.dailyWorkPrice ?? 0);
      if (daily > 0) {
        await this.upsertExpense(journeyId, dailyCat, daily, dailyLabel, updater, manager);
      }
    }

    if (postSheetNolon && !nolonAlreadyPostedAsFees && sheetNolon > 0) {
      await this.upsertExpense(
        journeyId,
        commissionCat,
        sheetNolon,
        commissionLabel,
        updater,
        manager,
      );
    }
  }

  private async resolveSheetRow(
    priceRepo: Repository<DeliveryPrice>,
    journey: Journey,
    areaId: number,
    onDate: Date | string,
  ): Promise<DeliveryPrice | null> {
    const kind = journey.client?.pricingSheetKind ?? PricingSheetKind.ARISH;
    const dateStr =
      onDate instanceof Date ? onDate.toISOString().slice(0, 10) : String(onDate).slice(0, 10);

    const qb = priceRepo
      .createQueryBuilder('price')
      .leftJoinAndSelect('price.priceType', 'priceType')
      .where('price.client_id = :clientId', { clientId: journey.client.id })
      .andWhere('price.area_id = :areaId', { areaId })
      .andWhere(':onDate BETWEEN price.validFrom AND price.validTo', { onDate: dateStr })
      .orderBy('price.validFrom', 'DESC');

    if (kind === PricingSheetKind.ARISH && journey.packingType) {
      qb.andWhere('(priceType.name = :packingType OR priceType.id IS NULL)', {
        packingType: journey.packingType,
      });
    }

    return (await qb.getOne()) ?? null;
  }

  private async latestPolicyAreaId(
    journeyId: number,
    manager?: EntityManager,
  ): Promise<number | null> {
    const policyRepo = manager ? manager.getRepository(JourneyPolicy) : this.policyRepository;
    const policy = await policyRepo.findOne({
      where: { journey: { id: journeyId } },
      relations: ['deliveryArea'],
      order: { policyDate: 'DESC', createdAt: 'DESC' },
    });
    return policy?.deliveryArea?.id ?? null;
  }

  private async custodyAlreadyGiven(
    journeyId: number,
    manager?: EntityManager,
  ): Promise<number> {
    const repo = manager ? manager.getRepository(JourneyTransaction) : this.transactionRepository;
    const rows = await repo.find({
      where: { journey: { id: journeyId }, category: JourneyTransactionCategoryType.CUSTODY },
    });
    return rows.reduce((sum, row) => sum + Number(row.amount ?? 0), 0);
  }

  private async upsertExpense(
    journeyId: number,
    category: JourneyTransactionCategoryType,
    amount: number,
    description: string,
    updater?: string,
    manager?: EntityManager,
  ): Promise<void> {
    const repo = manager ? manager.getRepository(JourneyTransaction) : this.transactionRepository;
    let existing = await repo.findOne({
      where: { journey: { id: journeyId }, category },
    });
    if (!existing) {
      existing = repo.create({
        journey: { id: journeyId } as Journey,
        category,
        transactionType: JourneyTransactionType.EXPENSE,
      });
    }
    existing.amount = amount;
    existing.description = description;
    existing.transactionType = JourneyTransactionType.EXPENSE;
    const now = new Date();
    existing.updatedAt = now;
    existing.createdAt = existing.createdAt ?? now;
    if (updater) {
      existing.updatedBy = updater;
      existing.createdBy = existing.createdBy ?? updater;
    }
    await repo.save(existing);
  }
}
