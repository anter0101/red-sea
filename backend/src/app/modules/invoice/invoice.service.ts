import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, QueryFailedError, Repository } from 'typeorm';
import { AccountService } from '../account/account.service';
import { AccountActorType, AccountSystemKey } from '../account/account-system-keys';
import { DEFAULT_COMPANY_SETTINGS } from '../company-settings/company-settings.service';
import { CompanySettings } from '../company-settings/company-settings.entity';
import { DeliveryPrice } from '../delivery-price/delivery-price.entity';
import { Client } from '../factory/client.entity';
import { Journey } from '../journey/journey.entity';
import { JourneyPolicy } from '../journey-goods/journey-policy.entity';
import { JourneyStatus } from 'src/core/enums/journey';
import { PricingSheetKind } from 'src/core/enums/pricing-sheet-kind';
import { Transaction, TransactionStatus } from '../transaction/transaction.entity';
import { EntryType, TransactionLine } from '../transaction-line/transaction-line.entity';
import { TransactionService } from '../transaction/transaction.service';
import { generateUniqueCode } from 'src/core/utils/generator';
import { GeneratorTypes } from 'src/core/enums/generator-types';
import { CreateInvoiceDTO } from './dtos/create-invoice.dto';
import { QueryInvoiceDTO } from './dtos/query-invoice.dto';
import { Invoice } from './invoice.entity';
import { InvoiceJourney } from './invoice-journey.entity';
import { invoiceTotals, roundMoney, InvoiceTotals } from './invoice-calculator';
import { buildInvoiceLines, InvoiceLedgerLine } from './invoice-ledger.service';

export interface InvoicePreview {
  clientId: number;
  clientName: string;
  journeyCount: number;
  totals: InvoiceTotals;
  lines: Array<Omit<InvoiceLedgerLine, 'account'>>;
}

export interface InvoiceJourneyView {
  journeyId: number;
  delegateNumber: string | null;
  policyNo: string | null;
  revenueAmount: number;
  governorate: string | null;
  receivedCompany: string | null;
  packingType: string | null;
  destination: string | null;
  journeyDate: string | null;
  quantity: number | null;
  unitPrice: number;
  /** مطالبة rate (delivery_prices.basePrice). Null when no sheet row matches. */
  claimUnitPrice: number | null;
}

export interface InvoiceView {
  id: number;
  code: string;
  date: string;
  clientId: number | null;
  clientName: string | null;
  pricingSheetKind: PricingSheetKind | null;
  companyName: string | null;
  taxCard: string | null;
  commercialRegister: string | null;
  taxEnabled: boolean;
  vatPercentage: number;
  withholdingPercentage: number;
  totalRevenue: number;
  vatAmount: number;
  withholdingAmount: number;
  netAmount: number;
  transactionId: number | null;
  journeyCount: number;
  journeys: InvoiceJourneyView[];
}

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceJourney)
    private readonly invoiceJourneyRepository: Repository<InvoiceJourney>,
    @InjectRepository(Journey)
    private readonly journeyRepository: Repository<Journey>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(CompanySettings)
    private readonly companySettingsRepository: Repository<CompanySettings>,
    @InjectRepository(DeliveryPrice)
    private readonly deliveryPriceRepository: Repository<DeliveryPrice>,
    private readonly accountService: AccountService,
    private readonly transactionService: TransactionService,
  ) {}

  async preview(dto: CreateInvoiceDTO): Promise<InvoicePreview> {
    const loaded = await this.prepare(dto);
    const lines = buildInvoiceLines({ totals: loaded.totals, ...loaded.accounts });
    return {
      clientId: dto.clientId,
      clientName: loaded.clientName,
      journeyCount: loaded.ids.length,
      totals: loaded.totals,
      lines: lines.map(({ account: _account, ...line }) => line),
    };
  }

  async issue(
    dto: CreateInvoiceDTO,
    creator?: string,
    manager?: EntityManager,
  ): Promise<InvoiceView> {
    if (!manager) {
      throw new BadRequestException('إصدار الفاتورة لازم يتم في معاملة واحدة.');
    }
    const loaded = await this.prepare(dto, manager);
    const invoiceRepo = manager.getRepository(Invoice);
    const invoice = invoiceRepo.create({
      client: { id: dto.clientId } as Client,
      clientName: loaded.clientName,
      companyName: loaded.company.name,
      taxCard: loaded.company.taxCard,
      commercialRegister: loaded.company.commercialRegister,
      date: new Date().toISOString().slice(0, 10),
      taxEnabled: dto.taxEnabled,
      vatPercentage: dto.vatPercentage,
      withholdingPercentage: dto.withholdingPercentage,
      totalRevenue: loaded.totals.totalRevenue,
      vatAmount: loaded.totals.vatAmount,
      withholdingAmount: loaded.totals.withholdingAmount,
      netAmount: loaded.totals.netAmount,
    });
    invoice.code = await generateUniqueCode(invoiceRepo, GeneratorTypes.INVOICE);

    let saved: Invoice;
    try {
      saved = await invoiceRepo.save(invoice);
      const rowRepo = manager.getRepository(InvoiceJourney);
      await rowRepo.save(
        loaded.ids.map((id) => {
          const line = loaded.lines.get(id);
          return rowRepo.create({
            invoice: { id: saved.id } as Invoice,
            journey: { id } as Journey,
            revenueAmount: line?.revenueAmount ?? loaded.amounts.get(id),
            governorate: line?.governorate ?? null,
            receivedCompany: line?.receivedCompany ?? null,
            packingType: line?.packingType ?? null,
            destination: line?.destination ?? null,
            journeyDate: line?.journeyDate ?? null,
            quantity: line?.quantity ?? null,
            unitPrice: line?.unitPrice ?? null,
          });
        }),
      );
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new BadRequestException('فيه رحلة عليها فاتورة بالفعل.');
      }
      throw error;
    }

    const lines = buildInvoiceLines({ totals: loaded.totals, ...loaded.accounts });
    if (lines.length < 2) {
      throw new BadRequestException('الفاتورة بدون قيود.');
    }

    const key = `invoice:${saved.id}`;
    const txRepo = manager.getRepository(Transaction);
    const already = await txRepo.findOne({ where: { idempotencyKey: key } });
    if (already) {
      throw new BadRequestException('الفاتورة مترحلة بالفعل.');
    }

    const transaction = new Transaction();
    transaction.date = new Date();
    transaction.description = `فاتورة ${saved.code}`;
    transaction.status = TransactionStatus.POSTED;
    transaction.idempotencyKey = key;
    transaction.transactionLines = lines.map((entry) => {
      const txLine = new TransactionLine();
      txLine.account = entry.account;
      txLine.entryType = entry.entryType;
      txLine.amount = entry.amount;
      txLine.description = entry.kind;
      return txLine;
    });
    const posted = await this.transactionService.save(transaction, creator, manager);

    saved.transaction = posted;
    saved.updatedAt = new Date();
    if (creator) saved.updatedBy = creator;
    await invoiceRepo.save(saved);

    await manager
      .getRepository(Journey)
      .update(
        { id: In(loaded.ids) },
        { tripStatus: JourneyStatus.INVOICE_ISSUED, updatedAt: new Date(), updatedBy: creator },
      );

    const full = await this.findEntity(saved.id, manager);
    return this.present(full!, manager);
  }

  async findAndCount(query: QueryInvoiceDTO): Promise<[InvoiceView[], number]> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const sortFields: Record<string, string> = {
      id: 'invoice.id',
      code: 'invoice.code',
      date: 'invoice.date',
      totalRevenue: 'invoice.totalRevenue',
      netAmount: 'invoice.netAmount',
    };
    const qb = this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.client', 'client')
      .loadRelationCountAndMap('invoice.journeyCount', 'invoice.journeys')
      .orderBy(
        sortFields[query.sortField ?? ''] ?? 'invoice.id',
        query.sortField ? (query.sortOrder ?? 'ASC') : 'DESC',
      )
      .skip((page - 1) * pageSize)
      .take(pageSize);

    if (query.clientId) {
      qb.andWhere('client.id = :clientId', { clientId: query.clientId });
    }
    if (query.search?.trim()) {
      qb.andWhere(
        '(invoice.code ILIKE :term OR invoice.clientName ILIKE :term OR client.name ILIKE :term)',
        { term: `%${query.search.trim()}%` },
      );
    }

    const [rows, count] = await qb.getManyAndCount();
    return [rows.map((row) => toView(row)), count];
  }

  async findById(id: number): Promise<InvoiceView | undefined> {
    const invoice = await this.findEntity(id);
    return invoice ? this.present(invoice) : undefined;
  }

  private async prepare(dto: CreateInvoiceDTO, manager?: EntityManager) {
    const ids = [...new Set(dto.journeyIds)];
    const journeyRepo = manager ? manager.getRepository(Journey) : this.journeyRepository;
    const invoiceJourneyRepo = manager
      ? manager.getRepository(InvoiceJourney)
      : this.invoiceJourneyRepository;

    const journeys = await journeyRepo.find({
      where: { id: In(ids) },
      relations: [
        'client',
        'deliveryGov',
        'deliveryArea',
        'journeyPolicies',
        'journeyPolicies.deliveryGov',
        'journeyPolicies.deliveryArea',
      ],
    });
    const errors: string[] = [];
    if (journeys.length !== ids.length) {
      errors.push('فيه رحلة مش موجودة.');
    }
    for (const journey of journeys) {
      const label = journey.delegateNumber ?? String(journey.id);
      if (journey.client?.id !== dto.clientId) {
        errors.push(`الرحلة ${label} مش تابعة للعميل المختار.`);
      }
    }

    const billed = await invoiceJourneyRepo.find({
      where: { journey: { id: In(ids) } },
      relations: ['journey'],
    });
    for (const row of billed) {
      const label = row.journey?.delegateNumber ?? String(row.journey?.id ?? '');
      errors.push(`الرحلة ${label} عليها فاتورة بالفعل.`);
    }

    const billedIds = new Set(
      billed.map((row) => row.journey?.id).filter((id): id is number => id != null),
    );
    const amounts = new Map<number, number>();
    for (const journey of journeys) {
      if (billedIds.has(journey.id)) continue;
      const label = journey.delegateNumber ?? String(journey.id);
      const amount = await this.postedTrn1Amount(journey.id, manager);
      if (amount == null || amount <= 0) {
        errors.push(`الرحلة ${label} بدون قيد إيراد مرحّل.`);
      } else {
        amounts.set(journey.id, amount);
      }
    }

    if (errors.length) {
      throw new BadRequestException(errors.join(' '));
    }

    const revenue = roundMoney([...amounts.values()].reduce((sum, amount) => sum + amount, 0));
    if (revenue <= 0) {
      throw new BadRequestException('الفاتورة بدون إيراد.');
    }

    const clientName = journeys[0]?.client?.name ?? '';
    const lines = new Map<number, InvoiceLineSnapshot>();
    for (const journey of journeys) {
      const amount = amounts.get(journey.id);
      if (amount == null) continue;
      lines.set(journey.id, lineSnapshot(journey, amount));
    }
    const totals = invoiceTotals({
      revenue,
      taxEnabled: dto.taxEnabled,
      vatPercentage: Number(dto.vatPercentage),
      withholdingPercentage: Number(dto.withholdingPercentage),
    });
    const accounts = await this.accountsFor(dto.clientId, clientName, undefined, manager);
    const company = await this.companyHeader(manager);
    return { ids, amounts, lines, totals, accounts, clientName, company };
  }

  private async companyHeader(manager?: EntityManager) {
    const repo = manager ? manager.getRepository(CompanySettings) : this.companySettingsRepository;
    const [row] = await repo.find({ order: { id: 'ASC' }, take: 1 });
    if (!row) return DEFAULT_COMPANY_SETTINGS;
    return {
      name: row.name,
      taxCard: row.taxCard,
      commercialRegister: row.commercialRegister,
    };
  }

  private async accountsFor(
    clientId: number,
    clientName: string,
    creator?: string,
    manager?: EntityManager,
  ) {
    await this.accountService.createClientAccounts(clientId, clientName, creator, manager);
    const [revenueInProgress, revenueDone, clientsInProgress, client] = await Promise.all([
      this.accountService.findActorLeaf(
        AccountSystemKey.REVENUE_IN_PROGRESS,
        AccountActorType.CLIENT,
        clientId,
        manager,
      ),
      this.accountService.findActorLeaf(
        AccountSystemKey.REVENUE_DONE,
        AccountActorType.CLIENT,
        clientId,
        manager,
      ),
      this.accountService.findActorLeaf(
        AccountSystemKey.CLIENTS_IN_PROGRESS,
        AccountActorType.CLIENT,
        clientId,
        manager,
      ),
      this.accountService.findActorLeaf(
        AccountSystemKey.CLIENTS,
        AccountActorType.CLIENT,
        clientId,
        manager,
      ),
    ]);
    const withholding = await this.accountService.findBySystemKey(
      AccountSystemKey.WITHHOLDING_TAX,
      manager,
    );
    const vat = await this.accountService.findBySystemKey(AccountSystemKey.VAT_PAYABLE, manager);
    if (!revenueInProgress || !revenueDone || !clientsInProgress || !client) {
      throw new BadRequestException('حسابات العميل مش مكتملة.');
    }
    return { revenueInProgress, revenueDone, withholding, clientsInProgress, client, vat };
  }

  private async postedTrn1Amount(
    journeyId: number,
    manager?: EntityManager,
  ): Promise<number | null> {
    const repo = manager ? manager.getRepository(Transaction) : this.transactionRepository;
    const rows = await repo
      .createQueryBuilder('tx')
      .innerJoin('tx.transactionLines', 'line')
      .where('tx.idempotencyKey LIKE :key', { key: `policy:%:journey:${journeyId}:TRN1` })
      .andWhere('tx.status = :status', { status: TransactionStatus.POSTED })
      .andWhere('line.entryType = :entry', { entry: EntryType.DEBIT })
      .select('line.amount', 'amount')
      .getRawMany<{ amount: string }>();
    if (!rows.length) return null;
    return roundMoney(rows.reduce((sum, row) => sum + Number(row.amount ?? 0), 0));
  }

  private async present(invoice: Invoice, manager?: EntityManager): Promise<InvoiceView> {
    return toView(invoice, await this.claimRates(invoice, manager));
  }

  /** مطالبة rate per journey, looked up like the sheet row used for revenue. */
  private async claimRates(
    invoice: Invoice,
    manager?: EntityManager,
  ): Promise<Map<number, number>> {
    const rates = new Map<number, number>();
    if (!invoice.client?.id) return rates;
    const kind = invoice.client.pricingSheetKind ?? PricingSheetKind.ARISH;
    for (const row of invoice.journeys ?? []) {
      const journey = row.journey;
      if (!journey?.id) continue;
      const policy = latestPolicy(journey);
      const areaId = policy?.deliveryArea?.id ?? journey.deliveryArea?.id;
      const onDate = priceDate(policy, sheetDate(row.journeyDate));
      if (!areaId || !onDate) continue;
      const rate = await this.claimRate(
        invoice.client.id,
        areaId,
        onDate,
        kind,
        journey.packingType,
        manager,
      );
      if (rate == null) continue;
      rates.set(journey.id, rate);
    }
    return rates;
  }

  private async claimRate(
    clientId: number,
    areaId: number,
    onDate: string,
    kind: PricingSheetKind,
    packingType: string | null | undefined,
    manager?: EntityManager,
  ): Promise<number | null> {
    const repo = manager ? manager.getRepository(DeliveryPrice) : this.deliveryPriceRepository;
    const qb = repo
      .createQueryBuilder('price')
      .leftJoin('price.priceType', 'priceType')
      .where('price.client_id = :clientId', { clientId })
      .andWhere('price.area_id = :areaId', { areaId })
      .andWhere(':onDate BETWEEN price.validFrom AND price.validTo', { onDate })
      .orderBy('price.validFrom', 'DESC');
    if (kind === PricingSheetKind.ARISH && packingType) {
      qb.andWhere('(priceType.name = :packingType OR priceType.id IS NULL)', { packingType });
    }
    const row = await qb.getOne();
    if (!row || row.basePrice == null) return null;
    const rate = Number(row.basePrice);
    if (!Number.isFinite(rate)) return null;
    return roundMoney(rate);
  }

  private async findEntity(id: number, manager?: EntityManager): Promise<Invoice | null> {
    const repo = manager ? manager.getRepository(Invoice) : this.invoiceRepository;
    return repo.findOne({
      where: { id },
      relations: [
        'client',
        'journeys',
        'journeys.journey',
        'journeys.journey.deliveryArea',
        'journeys.journey.journeyPolicies',
        'journeys.journey.journeyPolicies.deliveryArea',
        'transaction',
      ],
    });
  }
}

interface InvoiceLineSnapshot {
  governorate: string | null;
  receivedCompany: string | null;
  packingType: string | null;
  destination: string | null;
  journeyDate: string | null;
  quantity: number | null;
  unitPrice: number;
  revenueAmount: number;
}

function toView(invoice: Invoice, claimRates = new Map<number, number>()): InvoiceView {
  const journeys = (invoice.journeys ?? []).map((row) => {
    const journeyId = row.journey?.id;
    return {
      journeyId,
      delegateNumber: row.journey?.delegateNumber ?? null,
      policyNo: null,
      revenueAmount: Number(row.revenueAmount ?? 0),
      governorate: row.governorate ?? null,
      receivedCompany: row.receivedCompany ?? null,
      packingType: row.packingType ?? null,
      destination: row.destination ?? null,
      journeyDate: sheetDate(row.journeyDate),
      quantity: row.quantity == null ? null : Number(row.quantity),
      unitPrice: Number(row.unitPrice ?? 0),
      claimUnitPrice:
        journeyId != null && claimRates.has(journeyId) ? claimRates.get(journeyId)! : null,
    };
  });
  return {
    id: invoice.id,
    code: invoice.code,
    date: invoice.date ? String(invoice.date).slice(0, 10) : '',
    clientId: invoice.client?.id ?? null,
    clientName: invoice.clientName ?? invoice.client?.name ?? null,
    pricingSheetKind: invoice.client?.pricingSheetKind ?? null,
    companyName: invoice.companyName ?? null,
    taxCard: invoice.taxCard ?? null,
    commercialRegister: invoice.commercialRegister ?? null,
    taxEnabled: invoice.taxEnabled,
    vatPercentage: Number(invoice.vatPercentage ?? 0),
    withholdingPercentage: Number(invoice.withholdingPercentage ?? 0),
    totalRevenue: Number(invoice.totalRevenue ?? 0),
    vatAmount: Number(invoice.vatAmount ?? 0),
    withholdingAmount: Number(invoice.withholdingAmount ?? 0),
    netAmount: Number(invoice.netAmount ?? 0),
    transactionId: invoice.transaction?.id ?? null,
    journeyCount: invoice.journeyCount ?? journeys.length,
    journeys,
  };
}

function lineSnapshot(journey: Journey, revenueAmount: number): InvoiceLineSnapshot {
  const policy = latestPolicy(journey);
  const quantity = journey.quantity == null ? null : Number(journey.quantity);
  return {
    governorate: journey.deliveryGov?.name ?? policy?.deliveryGov?.name ?? null,
    receivedCompany: journey.receivedCompany ?? null,
    packingType: journey.packingType ?? null,
    destination:
      journey.deliveryArea?.name ?? policy?.deliveryArea?.name ?? journey.direction ?? null,
    journeyDate: sheetDate(policy?.tripDate ?? policy?.loadingDate ?? journey.delegateDate),
    quantity,
    unitPrice: unitPrice(quantity, revenueAmount),
    revenueAmount,
  };
}

function latestPolicy(journey?: Journey | null) {
  const policies = (journey?.journeyPolicies ?? []).filter((policy) => !policy.deletedAt);
  if (!policies.length) return null;
  return [...policies].sort((a, b) => (b.id ?? 0) - (a.id ?? 0))[0];
}

function priceDate(policy: JourneyPolicy | null, fallback: string | null): string | null {
  const raw = (policy?.tripDate ?? policy?.policyDate) as Date | string | null | undefined;
  if (raw instanceof Date) return raw.toISOString().slice(0, 10);
  if (typeof raw === 'string' && raw) return raw.slice(0, 10);
  return fallback ? fallback.slice(0, 10) : null;
}

function sheetDate(value?: Date | string | null): string | null {
  if (!value) return null;
  if (typeof value === 'string') return value.slice(0, 10);
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${value.getFullYear()}-${month}-${day}`;
}

function unitPrice(quantity?: number | null, revenueAmount?: number): number {
  const qty = Number(quantity);
  const revenue = Number(revenueAmount ?? 0);
  if (Number.isFinite(qty) && qty > 0) return roundMoney(revenue / qty);
  return roundMoney(revenue);
}

function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof QueryFailedError && (error.driverError as { code?: string })?.code === '23505'
  );
}
