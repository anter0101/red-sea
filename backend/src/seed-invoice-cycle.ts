import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, IsNull, Like, Repository } from 'typeorm';
import { AppModule } from './app/app.module';
import { Area } from './app/modules/area/area.entity';
import { Car } from './app/modules/car/car.entity';
import { DeliveryPrice } from './app/modules/delivery-price/delivery-price.entity';
import { Driver } from './app/modules/driver/driver.entity';
import { Client } from './app/modules/factory/client.entity';
import { InvoiceService } from './app/modules/invoice/invoice.service';
import { Journey } from './app/modules/journey/journey.entity';
import { JourneyRevenueService } from './app/modules/journey/journey-revenue.service';
import { JourneyService } from './app/modules/journey/journey.service';
import { JourneyPolicy } from './app/modules/journey-goods/journey-policy.entity';
import { JourneyPolicyService } from './app/modules/journey-goods/journey-policy.service';
import { PolicyLedgerService } from './app/modules/journey-goods/policy-ledger.service';
import { Trailer } from './app/modules/trailer/trailer.entity';
import { JourneyStatus } from './core/enums/journey';
import { PackingType } from './core/enums/packing-type';
import { PricingSheetKind } from './core/enums/pricing-sheet-kind';
import { OwnerShipType } from './core/enums/ownerShip-types';
import { withTransaction } from './core/utils/transaction';

const SEED_PREFIX = 'SEED-CYCLE';
const TAX_PREFIX = 'SEED-TAX';
const VALID_FROM = '2026-01-01';
const VALID_TO = '2026-12-31';
const JOURNEYS_PER_CLIENT = 30;
const JOURNEYS_PER_INVOICE = 6;
const CREATOR = 'seed';

const RECEIVED_COMPANIES = [
  'شركة العريش للأسمنت',
  'الشركة الوطنية للأسمنت',
  'جهاز مشروعات الخدمة الوطنية',
  'مصنع بني سويف',
];

const PACKING = [PackingType.BAGGED, PackingType.LOOSE, PackingType.JUMBO_BAG];
const GRADES = ['32.5', '42.5', '52.5'];

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function tripDateFor(index: number): Date {
  const day = String((index % 28) + 1).padStart(2, '0');
  return new Date(`2026-09-${day}T12:00:00.000Z`);
}

class InvoiceCycleSeeder {
  constructor(
    private readonly logger: Logger,
    private readonly dataSource: DataSource,
    private readonly clients: Repository<Client>,
    private readonly areas: Repository<Area>,
    private readonly prices: Repository<DeliveryPrice>,
    private readonly journeys: Repository<Journey>,
    private readonly cars: Repository<Car>,
    private readonly drivers: Repository<Driver>,
    private readonly trailers: Repository<Trailer>,
    private readonly journeyService: JourneyService,
    private readonly revenueService: JourneyRevenueService,
    private readonly policyService: JourneyPolicyService,
    private readonly ledgerService: PolicyLedgerService,
    private readonly invoiceService: InvoiceService,
  ) {}

  async run(): Promise<void> {
    const arish = await this.requireClient('C-ARISH', 'مصنع اسمنت العريش', PricingSheetKind.ARISH);
    const watania = await this.requireClient('C-WATANIA', 'مصنع وطنيه', PricingSheetKind.WATANIA);
    const areas = await this.areas.find({ where: { deletedAt: IsNull() } });
    if (!areas.length) {
      throw new Error('No areas found. Run pnpm seed first.');
    }

    const createdPrices = await this.seedPrices([arish, watania], areas);
    this.logger.log(`Delivery prices created: ${createdPrices}`);

    const fleet = await this.fleet();
    await this.seedPlainInvoices(arish, watania, areas, fleet);
    await this.seedTaxInvoices(arish, watania, areas, fleet);
  }

  private async seedPlainInvoices(
    arish: Client,
    watania: Client,
    areas: Area[],
    fleet: { cars: Car[]; drivers: Driver[]; trailers: Trailer[] },
  ) {
    const already = await this.journeys.count({
      where: { sellingOrderNo: Like(`${SEED_PREFIX}-%`) },
    });
    if (already > 0) {
      this.logger.warn(
        `${SEED_PREFIX} journeys already exist (${already}). Skipping untaxed invoices.`,
      );
      return;
    }

    const created: Array<{ id: number; clientId: number }> = [];
    for (const client of [arish, watania]) {
      for (let i = 0; i < JOURNEYS_PER_CLIENT; i += 1) {
        const index = created.length + 1;
        const journeyId = await this.cycleJourney(client, areas, fleet, index, SEED_PREFIX);
        created.push({ id: journeyId, clientId: client.id });
      }
    }

    for (const client of [arish, watania]) {
      const ids = created.filter((row) => row.clientId === client.id).map((row) => row.id);
      for (let offset = 0; offset < ids.length; offset += JOURNEYS_PER_INVOICE) {
        await this.issueInvoice(client.id, ids.slice(offset, offset + JOURNEYS_PER_INVOICE), {
          taxEnabled: false,
          vatPercentage: 0,
          withholdingPercentage: 0,
        });
      }
    }
  }

  private async seedTaxInvoices(
    arish: Client,
    watania: Client,
    areas: Area[],
    fleet: { cars: Car[]; drivers: Driver[]; trailers: Trailer[] },
  ) {
    const already = await this.journeys.count({
      where: { sellingOrderNo: Like(`${TAX_PREFIX}-%`) },
    });
    if (already > 0) {
      this.logger.warn(
        `${TAX_PREFIX} journeys already exist (${already}). Skipping taxed invoices.`,
      );
      return;
    }

    const cases: Array<{
      client: Client;
      taxEnabled: boolean;
      vatPercentage: number;
      withholdingPercentage: number;
    }> = [
      { client: arish, taxEnabled: true, vatPercentage: 14, withholdingPercentage: 0 },
      { client: arish, taxEnabled: false, vatPercentage: 14, withholdingPercentage: 3 },
      { client: watania, taxEnabled: true, vatPercentage: 14, withholdingPercentage: 3 },
    ];

    let index = 0;
    for (const taxCase of cases) {
      const journeyIds: number[] = [];
      for (let i = 0; i < JOURNEYS_PER_INVOICE; i += 1) {
        index += 1;
        journeyIds.push(await this.cycleJourney(taxCase.client, areas, fleet, index, TAX_PREFIX));
      }
      await this.issueInvoice(taxCase.client.id, journeyIds, taxCase);
    }
  }

  private async issueInvoice(
    clientId: number,
    journeyIds: number[],
    tax: { taxEnabled: boolean; vatPercentage: number; withholdingPercentage: number },
  ) {
    const invoice = await withTransaction(this.dataSource, (manager) =>
      this.invoiceService.issue(
        {
          clientId,
          journeyIds,
          taxEnabled: tax.taxEnabled,
          vatPercentage: tax.vatPercentage,
          withholdingPercentage: tax.withholdingPercentage,
        },
        CREATOR,
        manager,
      ),
    );
    this.logger.log(
      `${invoice.code} | ${invoice.clientName} | journeys ${invoice.journeyCount} | revenue ${invoice.totalRevenue} | VAT ${invoice.vatPercentage}% ${invoice.vatAmount} | withholding ${invoice.withholdingPercentage}% ${invoice.withholdingAmount} | net ${invoice.netAmount}`,
    );
  }

  private async requireClient(
    companyCode: string,
    name: string,
    kind: PricingSheetKind,
  ): Promise<Client> {
    const client = await this.clients.findOne({ where: [{ companyCode }, { name }] });
    if (!client) {
      throw new Error(`Client ${name} was not found. Run pnpm seed first.`);
    }
    client.pricingSheetKind = kind;
    client.updatedAt = new Date();
    client.updatedBy = CREATOR;
    return this.clients.save(client);
  }

  private async seedPrices(clients: Client[], areas: Area[]): Promise<number> {
    let created = 0;
    for (const client of clients) {
      for (const area of areas) {
        const existing = await this.prices
          .createQueryBuilder('price')
          .where('price.client_id = :clientId', { clientId: client.id })
          .andWhere('price.area_id = :areaId', { areaId: area.id })
          .andWhere('price.validFrom = :validFrom', { validFrom: VALID_FROM })
          .getOne();
        if (existing) continue;

        const row = this.prices.create({
          client,
          area,
          ...this.randomAmounts(client.pricingSheetKind),
          validFrom: VALID_FROM as unknown as Date,
          validTo: VALID_TO as unknown as Date,
          notes: SEED_PREFIX,
          createdBy: CREATOR,
          updatedBy: CREATOR,
        });
        await this.prices.save(row);
        created += 1;
      }
    }
    return created;
  }

  private randomAmounts(kind: PricingSheetKind) {
    const nolonPrice = randInt(40, 120);
    if (kind === PricingSheetKind.WATANIA) {
      const basePrice = randInt(80, 180);
      const additionalFees = randInt(10, 40);
      const taxPrice = randInt(5, 20);
      return {
        basePrice,
        additionalFees,
        taxPrice,
        totalPrice: basePrice + additionalFees + taxPrice,
        nolonPrice,
        employeeNolonAmount: 0,
      };
    }
    const basePrice = randInt(180, 260);
    return {
      basePrice,
      additionalFees: 0,
      taxPrice: 0,
      totalPrice: basePrice,
      nolonPrice,
      employeeNolonAmount: 0,
    };
  }

  private async fleet() {
    const alive = { deletedAt: IsNull() };
    const cars = await this.cars.find({
      where: { ...alive, ownerShip: OwnerShipType.COMPANY_CAR },
    });
    const drivers = await this.drivers.find({ where: alive });
    const trailers = await this.trailers.find({ where: alive });
    if (!cars.length || !drivers.length || !trailers.length) {
      throw new Error('Company cars, drivers, and trailers are required. Run pnpm seed first.');
    }
    return { cars, drivers, trailers };
  }

  private async cycleJourney(
    client: Client,
    areas: Area[],
    fleet: { cars: Car[]; drivers: Driver[]; trailers: Trailer[] },
    index: number,
    prefix: string,
  ): Promise<number> {
    const area = areas[index % areas.length];
    const quantity = randInt(50, 180);
    const tripDate = tripDateFor(index);
    const journey = new Journey();
    journey.driver = fleet.drivers[index % fleet.drivers.length];
    journey.car = fleet.cars[index % fleet.cars.length];
    journey.trailer = fleet.trailers[index % fleet.trailers.length];
    journey.client = client;
    journey.quantity = quantity;
    journey.packingType = PACKING[index % PACKING.length];
    journey.cementGrade = GRADES[index % GRADES.length];
    journey.receivedCompany = RECEIVED_COMPANIES[index % RECEIVED_COMPANIES.length];
    journey.deliveryArea = area;
    journey.deliveryGov = area.government;
    journey.direction = area.name;
    journey.sellingOrderNo = `${prefix}-${index}`;
    journey.delegateDate = tripDate;

    const saved = await this.journeyService.save(journey, CREATOR);
    const policy = new JourneyPolicy();
    policy.journey = saved;
    policy.deliveryArea = area;
    policy.deliveryGov = area.government;
    policy.bookWeight = quantity;
    policy.actualWeight = quantity;
    policy.deliveryWeight = quantity;
    policy.policyNo = `POL-${prefix}-${index}`;
    policy.policyDate = tripDate;
    policy.loadingDate = tripDate;
    policy.tripDate = tripDate;
    const savedPolicy = await this.policyService.save(policy, CREATOR);
    await this.journeyService.transitionStatus(saved.id, JourneyStatus.POLICY_COLLECTED, CREATOR);
    await this.revenueService.applyFromPolicy(savedPolicy, CREATOR);
    const ledger = await this.ledgerService.apply(saved.id, {}, CREATOR);
    const revenue = ledger.lines.find((line) => line.kind === 'TRN1' && line.amount > 0);
    if (!revenue) {
      throw new Error(
        `Journey ${saved.id} has no posted revenue. ${ledger.warnings.join(' ')}`.trim(),
      );
    }
    return saved.id;
  }
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  const logger = new Logger('InvoiceCycleSeed');
  try {
    const seeder = new InvoiceCycleSeeder(
      logger,
      app.get(DataSource),
      app.get(getRepositoryToken(Client)),
      app.get(getRepositoryToken(Area)),
      app.get(getRepositoryToken(DeliveryPrice)),
      app.get(getRepositoryToken(Journey)),
      app.get(getRepositoryToken(Car)),
      app.get(getRepositoryToken(Driver)),
      app.get(getRepositoryToken(Trailer)),
      app.get(JourneyService),
      app.get(JourneyRevenueService),
      app.get(JourneyPolicyService),
      app.get(PolicyLedgerService),
      app.get(InvoiceService),
    );
    await seeder.run();
    logger.log('Invoice cycle seed complete.');
  } catch (error) {
    logger.error('Invoice cycle seed failed.');
    logger.error(error instanceof Error ? (error.stack ?? error.message) : String(error));
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

void bootstrap();
