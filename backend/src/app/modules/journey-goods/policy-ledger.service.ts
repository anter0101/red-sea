import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Account } from '../account/account.entity';
import { AccountService } from '../account/account.service';
import {
  AccountActorType,
  AccountSystemKey,
  TRIP_EXPENSE_ACCOUNT_KEYS,
} from '../account/account-system-keys';
import { Journey } from '../journey/journey.entity';
import { JourneyPolicy } from './journey-policy.entity';
import { JourneyTransaction } from '../journey-transaction/journey-transaction.entity';
import { JourneyTransactionCategoryType, JourneyTransactionType } from 'src/core/enums/journey';
import { OwnerShipType } from 'src/core/enums/ownerShip-types';
import { Supplier } from '../supplier/supplier.entity';
import { SupplierType } from '../supplier/enums/supplier-type.enum';
import { Employee } from '../employee/employee.entity';
import { Custody } from '../custody/custody.entity';
import { Transaction, TransactionStatus } from '../transaction/transaction.entity';
import { TransactionLine, EntryType } from '../transaction-line/transaction-line.entity';
import { TransactionService } from '../transaction/transaction.service';
import { PolicyExpensesDTO } from './dtos/policy-expenses.dto';

export type LedgerKind = 'TRN1' | 'TRN2' | 'TRN3';

export interface LedgerPreviewLine {
  kind: LedgerKind;
  category?: string;
  amount: number;
  debitPath: string;
  creditPath: string;
  alreadyPosted: boolean;
}

export interface LedgerPreview {
  policyId: number;
  journeyId: number;
  lines: LedgerPreviewLine[];
  warnings: string[];
}

export interface LedgerApplyInput {
  transportSupplierId?: number;
}

@Injectable()
export class PolicyLedgerService {
  constructor(
    @InjectRepository(JourneyPolicy)
    private readonly policyRepository: Repository<JourneyPolicy>,
    @InjectRepository(Journey)
    private readonly journeyRepository: Repository<Journey>,
    @InjectRepository(JourneyTransaction)
    private readonly journeyTransactionRepository: Repository<JourneyTransaction>,
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Custody)
    private readonly custodyRepository: Repository<Custody>,
    private readonly accountService: AccountService,
    private readonly transactionService: TransactionService,
  ) {}

  async preview(journeyId: number, input: LedgerApplyInput = {}): Promise<LedgerPreview> {
    const loaded = await this.load(journeyId, input);
    return {
      policyId: loaded.policy.id,
      journeyId: loaded.journey.id,
      lines: loaded.lines.map((line) => ({
        kind: line.kind,
        category: line.category,
        amount: line.amount,
        debitPath: line.debitPath,
        creditPath: line.creditPath,
        alreadyPosted: line.alreadyPosted,
      })),
      warnings: loaded.warnings,
    };
  }

  /** Expense categories whose TRN3 entry is already posted for the journey's policy. */
  async postedExpenseCategories(journeyId: number, manager?: EntityManager): Promise<string[]> {
    const policyRepo = manager ? manager.getRepository(JourneyPolicy) : this.policyRepository;
    const txRepo = manager ? manager.getRepository(Transaction) : this.transactionRepository;
    const policy = await policyRepo.findOne({ where: { journey: { id: journeyId } } });
    if (!policy) return [];
    const prefix = `${this.idempotencyKey(policy.id, journeyId, 'TRN3')}:`;
    const rows = await txRepo
      .createQueryBuilder('tx')
      .select('tx.idempotencyKey', 'key')
      .where('tx.idempotencyKey LIKE :prefix', { prefix: `${prefix}%` })
      .getRawMany<{ key: string }>();
    return rows.map((row) => row.key.slice(prefix.length));
  }

  async getExpenses(journeyId: number): Promise<PolicyExpensesDTO> {
    const rows = await this.journeyTransactionRepository.find({
      where: { journey: { id: journeyId } },
    });
    const row = (category: JourneyTransactionCategoryType) =>
      rows.find((item) => item.category === category);
    const amount = (category: JourneyTransactionCategoryType) => {
      const found = row(category);
      return found ? Number(found.amount) : undefined;
    };
    return {
      dieselFees: amount(JourneyTransactionCategoryType.DIESEL_FEES),
      fuelLiters: row(JourneyTransactionCategoryType.DIESEL_FEES)?.quantity ?? undefined,
      cardFees: amount(JourneyTransactionCategoryType.CARD_FEES),
      cardName: row(JourneyTransactionCategoryType.CARD_FEES)?.description ?? undefined,
      scaleFees: amount(JourneyTransactionCategoryType.SCALE_FEES),
      tipsFees: amount(JourneyTransactionCategoryType.TIPS_FEES),
    };
  }

  /**
   * Upserts the company-car trip expenses entered on the policy form.
   * A category that is already posted cannot change its amount.
   */
  async saveExpenses(
    journeyId: number,
    expenses: PolicyExpensesDTO | undefined,
    creator?: string,
    manager?: EntityManager,
  ): Promise<void> {
    if (!expenses) return;
    const journeyRepo = manager ? manager.getRepository(Journey) : this.journeyRepository;
    const jtRepo = manager
      ? manager.getRepository(JourneyTransaction)
      : this.journeyTransactionRepository;

    const journey = await journeyRepo.findOne({ where: { id: journeyId }, relations: ['car'] });
    if (!journey) throw new NotFoundException(`Journey ${journeyId} not found`);
    if (this.isSupplierCar(journey.car?.ownerShip)) return;

    const posted = new Set(await this.postedExpenseCategories(journeyId, manager));
    const inputs: Array<{
      category: JourneyTransactionCategoryType;
      amount?: number;
      quantity?: number;
      description?: string;
    }> = [
      {
        category: JourneyTransactionCategoryType.DIESEL_FEES,
        amount: expenses.dieselFees,
        quantity: expenses.fuelLiters,
      },
      {
        category: JourneyTransactionCategoryType.CARD_FEES,
        amount: expenses.cardFees,
        description: expenses.cardName,
      },
      { category: JourneyTransactionCategoryType.SCALE_FEES, amount: expenses.scaleFees },
      { category: JourneyTransactionCategoryType.TIPS_FEES, amount: expenses.tipsFees },
    ];

    const now = new Date();
    for (const input of inputs) {
      if (input.amount == null) continue;
      const amount = this.round(Number(input.amount));
      const existing = await jtRepo.findOne({
        where: { journey: { id: journeyId }, category: input.category },
      });

      if (posted.has(input.category)) {
        if (this.round(Number(existing?.amount ?? 0)) !== amount) {
          throw new BadRequestException('لا يمكن تعديل مصروف تم ترحيله');
        }
        continue;
      }

      if (amount <= 0) {
        if (existing) await jtRepo.delete(existing.id);
        continue;
      }

      const row = existing ?? new JourneyTransaction();
      row.journey = { id: journeyId } as Journey;
      row.transactionType = JourneyTransactionType.EXPENSE;
      row.category = input.category;
      row.amount = amount;
      if (input.quantity !== undefined) row.quantity = input.quantity;
      if (input.description !== undefined) row.description = input.description;
      row.createdAt = row.createdAt ?? now;
      row.updatedAt = now;
      if (creator) {
        row.createdBy = row.createdBy ?? creator;
        row.updatedBy = creator;
      }
      await jtRepo.save(row);
    }
  }

  async apply(
    journeyId: number,
    input: LedgerApplyInput,
    creator?: string,
    manager?: EntityManager,
  ): Promise<LedgerPreview> {
    const loaded = await this.load(journeyId, input, manager);
    if (loaded.blocking) {
      throw new BadRequestException(loaded.warnings.join(' '));
    }

    const txRepo = manager ? manager.getRepository(Transaction) : this.transactionRepository;
    for (const line of loaded.lines) {
      if (line.alreadyPosted || line.amount <= 0) continue;
      const key = this.idempotencyKey(
        loaded.policy.id,
        loaded.journey.id,
        line.kind,
        line.category,
      );
      const existing = await txRepo.findOne({ where: { idempotencyKey: key } });
      if (existing) continue;

      const label = line.category ? `${line.kind} ${line.category}` : line.kind;

      const debit = new TransactionLine();
      debit.account = line.debit;
      debit.entryType = EntryType.DEBIT;
      debit.amount = line.amount;
      debit.description = label;

      const credit = new TransactionLine();
      credit.account = line.credit;
      credit.entryType = EntryType.CREDIT;
      credit.amount = line.amount;
      credit.description = label;

      const transaction = new Transaction();
      transaction.date = new Date();
      transaction.description = `${label} policy ${loaded.policy.id}`;
      transaction.status = TransactionStatus.POSTED;
      transaction.idempotencyKey = key;
      transaction.transactionLines = [debit, credit];
      await this.transactionService.save(transaction, creator, manager);
    }

    const after = await this.load(journeyId, input, manager);
    return {
      policyId: after.policy.id,
      journeyId: after.journey.id,
      lines: after.lines.map((line) => ({
        kind: line.kind,
        category: line.category,
        amount: line.amount,
        debitPath: line.debitPath,
        creditPath: line.creditPath,
        alreadyPosted: true,
      })),
      warnings: after.warnings,
    };
  }

  private idempotencyKey(
    policyId: number,
    journeyId: number,
    kind: LedgerKind,
    category?: string,
  ): string {
    const base = `policy:${policyId}:journey:${journeyId}:${kind}`;
    return category ? `${base}:${category}` : base;
  }

  private isSupplierCar(ownerShip?: OwnerShipType | null): boolean {
    return ownerShip === OwnerShipType.NOLON_CAR || ownerShip === OwnerShipType.CONTRACT_CAR;
  }

  private round(amount: number): number {
    return Math.round(amount * 100) / 100;
  }

  private async load(journeyId: number, input: LedgerApplyInput, manager?: EntityManager) {
    const policyRepo = manager ? manager.getRepository(JourneyPolicy) : this.policyRepository;
    const journeyRepo = manager ? manager.getRepository(Journey) : this.journeyRepository;
    const jtRepo = manager
      ? manager.getRepository(JourneyTransaction)
      : this.journeyTransactionRepository;
    const supplierRepo = manager ? manager.getRepository(Supplier) : this.supplierRepository;
    const employeeRepo = manager ? manager.getRepository(Employee) : this.employeeRepository;
    const txRepo = manager ? manager.getRepository(Transaction) : this.transactionRepository;

    const policy = await policyRepo.findOne({
      where: { journey: { id: journeyId } },
      relations: ['journey'],
    });
    if (!policy) throw new NotFoundException(`Policy for journey ${journeyId} not found`);

    const journey = await journeyRepo.findOne({
      where: { id: journeyId },
      relations: ['client', 'car', 'custodySource', 'transportSupplier'],
    });
    if (!journey) throw new NotFoundException(`Journey ${journeyId} not found`);

    if (input.transportSupplierId && !journey.transportSupplier?.id) {
      journey.transportSupplier = { id: input.transportSupplierId } as Supplier;
      await journeyRepo.save(journey);
    }

    const warnings: string[] = [];
    const clientId = journey.client?.id;
    if (!clientId) warnings.push('الرحلة بدون عميل.');
    else {
      await this.accountService.createClientAccounts(
        clientId,
        journey.client.name,
        undefined,
        manager,
      );
    }

    const revenue = Number(journey.actualRevenue ?? 0);
    const lines: Array<LedgerPreviewLine & { debit: Account; credit: Account }> = [];

    if (clientId && revenue > 0) {
      const debit = await this.accountService.findActorLeaf(
        AccountSystemKey.CLIENTS_IN_PROGRESS,
        AccountActorType.CLIENT,
        clientId,
        manager,
      );
      const credit = await this.accountService.findActorLeaf(
        AccountSystemKey.REVENUE_IN_PROGRESS,
        AccountActorType.CLIENT,
        clientId,
        manager,
      );
      if (debit && credit) {
        lines.push(await this.pair('TRN1', revenue, debit, credit, policy.id, journey.id, txRepo));
      }
    }

    const postsExpense = this.isSupplierCar(journey.car?.ownerShip);

    if (!postsExpense) {
      const custodyRepo = manager ? manager.getRepository(Custody) : this.custodyRepository;
      const custody = await custodyRepo.findOne({
        where: { journey: { id: journeyId } },
        relations: ['account', 'account.parentAccount'],
        order: { id: 'DESC' },
      });
      const rows = await jtRepo.find({ where: { journey: { id: journeyId } } });
      const sumOf = (category: JourneyTransactionCategoryType) =>
        rows
          .filter((row) => row.category === category)
          .reduce((sum, row) => sum + Number(row.amount ?? 0), 0);

      const expenseTotal = TRIP_EXPENSE_ACCOUNT_KEYS.reduce(
        (sum, [category]) => sum + sumOf(category),
        0,
      );
      if (expenseTotal > 0 && !custody?.account) {
        warnings.push('لا توجد عهدة سائق للرحلة.');
      } else if (custody?.account) {
        const custodyAmount = sumOf(JourneyTransactionCategoryType.CUSTODY);
        if (this.round(expenseTotal) > this.round(custodyAmount)) {
          warnings.push('مصروفات الرحلة أكبر من العهدة.');
        }
        for (const [category, key] of TRIP_EXPENSE_ACCOUNT_KEYS) {
          const amount = sumOf(category);
          if (amount <= 0) continue;
          const expenseAccount = await this.accountService.findBySystemKey(key, manager);
          lines.push(
            await this.pair(
              'TRN3',
              amount,
              expenseAccount,
              custody.account,
              policy.id,
              journey.id,
              txRepo,
              category,
            ),
          );
        }
      }
    }

    if (postsExpense) {
      const nolonRows = await jtRepo.find({
        where: { journey: { id: journeyId }, category: JourneyTransactionCategoryType.NOLON_FEES },
      });
      const nolon = nolonRows.reduce((sum, row) => sum + Number(row.amount ?? 0), 0);

      let transport: Supplier | null = null;
      if (journey.transportSupplier?.id) {
        transport = await supplierRepo.findOne({
          where: { id: journey.transportSupplier.id },
          relations: ['branch'],
        });
      }

      let branchId: number | undefined;
      if (journey.custodySource?.id) {
        const employee = await employeeRepo.findOne({
          where: { id: journey.custodySource.id },
          relations: ['branch'],
        });
        branchId = employee?.branch?.id;
      }

      if (!transport) {
        warnings.push('مورد النقل مطلوب للنولون والعقد.');
      } else if (transport.type !== SupplierType.TRANSPORTATION) {
        warnings.push('المورد المختار ليس مورد نقل.');
      } else if (branchId && transport.branch?.id && transport.branch.id !== branchId) {
        warnings.push('مورد النقل مش تابع لفرع الموظف.');
      } else {
        await this.accountService.createSupplierAccount(
          transport.id,
          transport.name,
          undefined,
          manager,
        );
        const supplierLeaf = await this.accountService.findActorLeaf(
          AccountSystemKey.TRANSPORT_SUPPLIER,
          AccountActorType.TRANSPORT_SUPPLIER,
          transport.id,
          manager,
        );
        const nolonAccount = await this.accountService.findBySystemKey(
          AccountSystemKey.NOLON_CONTRACT_CARS,
          manager,
        );
        if (supplierLeaf && nolon > 0) {
          lines.push(
            await this.pair(
              'TRN2',
              nolon,
              nolonAccount,
              supplierLeaf,
              policy.id,
              journey.id,
              txRepo,
            ),
          );
        }
      }
    }

    return {
      policy,
      journey,
      lines,
      warnings,
      blocking: postsExpense && !journey.transportSupplier?.id,
    };
  }

  private async pair(
    kind: LedgerKind,
    amount: number,
    debit: Account,
    credit: Account,
    policyId: number,
    journeyId: number,
    txRepo: Repository<Transaction>,
    category?: string,
  ): Promise<LedgerPreviewLine & { debit: Account; credit: Account }> {
    const key = this.idempotencyKey(policyId, journeyId, kind, category);
    const existing = await txRepo.findOne({ where: { idempotencyKey: key } });
    return {
      kind,
      category,
      amount: this.round(amount),
      debit,
      credit,
      debitPath: this.path(debit),
      creditPath: this.path(credit),
      alreadyPosted: Boolean(existing),
    };
  }

  private path(account: Account): string {
    const parent = account.parentAccount?.name;
    return parent ? `${parent} → ${account.name}` : account.name;
  }
}
