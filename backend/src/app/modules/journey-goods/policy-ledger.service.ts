import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Account } from '../account/account.entity';
import { AccountService } from '../account/account.service';
import { AccountActorType, AccountSystemKey } from '../account/account-system-keys';
import { Journey } from '../journey/journey.entity';
import { JourneyPolicy } from './journey-policy.entity';
import { JourneyTransaction } from '../journey-transaction/journey-transaction.entity';
import { JourneyTransactionCategoryType } from 'src/core/enums/journey';
import { OwnerShipType } from 'src/core/enums/ownerShip-types';
import { Supplier } from '../supplier/supplier.entity';
import { SupplierType } from '../supplier/enums/supplier-type.enum';
import { Employee } from '../employee/employee.entity';
import { Transaction, TransactionStatus } from '../transaction/transaction.entity';
import { TransactionLine, EntryType } from '../transaction-line/transaction-line.entity';
import { TransactionService } from '../transaction/transaction.service';

export type LedgerKind = 'TRN1' | 'TRN2' | 'TRN3_OFFICE' | 'TRN3_CUSTODY_SUPPLIER';

export interface LedgerPreviewLine {
  kind: LedgerKind;
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
  custodySupplierId?: number;
  custodySupplierAmount?: number;
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
        amount: line.amount,
        debitPath: line.debitPath,
        creditPath: line.creditPath,
        alreadyPosted: line.alreadyPosted,
      })),
      warnings: loaded.warnings,
    };
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
      const key = this.idempotencyKey(loaded.policy.id, loaded.journey.id, line.kind);
      const existing = await txRepo.findOne({ where: { idempotencyKey: key } });
      if (existing) continue;

      const debit = new TransactionLine();
      debit.account = line.debit;
      debit.entryType = EntryType.DEBIT;
      debit.amount = line.amount;
      debit.description = line.kind;

      const credit = new TransactionLine();
      credit.account = line.credit;
      credit.entryType = EntryType.CREDIT;
      credit.amount = line.amount;
      credit.description = line.kind;

      const transaction = new Transaction();
      transaction.date = new Date();
      transaction.description = `${line.kind} policy ${loaded.policy.id}`;
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
        amount: line.amount,
        debitPath: line.debitPath,
        creditPath: line.creditPath,
        alreadyPosted: true,
      })),
      warnings: after.warnings,
    };
  }

  private idempotencyKey(policyId: number, journeyId: number, kind: LedgerKind): string {
    return `policy:${policyId}:journey:${journeyId}:${kind}`;
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
      relations: ['client', 'car', 'custodySource', 'transportSupplier', 'custodySupplier'],
    });
    if (!journey) throw new NotFoundException(`Journey ${journeyId} not found`);

    if (input.transportSupplierId) {
      journey.transportSupplier = { id: input.transportSupplierId } as Supplier;
    }
    if (input.custodySupplierId) {
      journey.custodySupplier = { id: input.custodySupplierId } as Supplier;
    }
    if (input.custodySupplierAmount != null) {
      journey.custodySupplierAmount = input.custodySupplierAmount;
    }
    if (
      input.transportSupplierId ||
      input.custodySupplierId ||
      input.custodySupplierAmount != null
    ) {
      await journeyRepo.save(journey);
    }

    const warnings: string[] = [];
    const clientId = journey.client?.id;
    if (!clientId) warnings.push('الرحلة بدون عميل.');
    else {
      await this.accountService.createClientAccounts(clientId, journey.client.name, undefined, manager);
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

    const mode = journey.car?.ownerShip;
    const postsExpense =
      mode === OwnerShipType.NOLON_CAR || mode === OwnerShipType.CONTRACT_CAR;

    if (postsExpense) {
      const nolonRows = await jtRepo.find({
        where: { journey: { id: journeyId }, category: JourneyTransactionCategoryType.NOLON_FEES },
      });
      const nolon = nolonRows.reduce((sum, row) => sum + Number(row.amount ?? 0), 0);

      const custodyRows = await jtRepo.find({
        where: { journey: { id: journeyId }, category: JourneyTransactionCategoryType.CUSTODY },
      });
      const officeAmount = custodyRows.reduce((sum, row) => sum + Number(row.amount ?? 0), 0);
      const custodySupplierAmount = Number(journey.custodySupplierAmount ?? 0);

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
        if (branchId && employee?.branch?.name) {
          await this.accountService.createBranchAccount(
            branchId,
            employee.branch.name,
            undefined,
            manager,
          );
        }
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
          'transport',
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
            await this.pair('TRN2', nolon, nolonAccount, supplierLeaf, policy.id, journey.id, txRepo),
          );
        }

        if (supplierLeaf && branchId && officeAmount > 0) {
          const officeLeaf = await this.accountService.findActorLeaf(
            AccountSystemKey.CUSTODY,
            AccountActorType.BRANCH,
            branchId,
            manager,
          );
          if (officeLeaf) {
            lines.push(
              await this.pair(
                'TRN3_OFFICE',
                officeAmount,
                supplierLeaf,
                officeLeaf,
                policy.id,
                journey.id,
                txRepo,
              ),
            );
          }
        }

        if (supplierLeaf && journey.custodySupplier?.id && custodySupplierAmount > 0) {
          const custodySupplier = await supplierRepo.findOne({
            where: { id: journey.custodySupplier.id },
          });
          if (!custodySupplier || custodySupplier.type !== SupplierType.CUSTODY) {
            warnings.push('مورد العهدة غير موجود.');
          } else {
            await this.accountService.createSupplierAccount(
              custodySupplier.id,
              custodySupplier.name,
              'custody',
              undefined,
              manager,
            );
            const custodyLeaf = await this.accountService.findActorLeaf(
              AccountSystemKey.CUSTODY_SUPPLIER,
              AccountActorType.CUSTODY_SUPPLIER,
              custodySupplier.id,
              manager,
            );
            if (custodyLeaf) {
              lines.push(
                await this.pair(
                  'TRN3_CUSTODY_SUPPLIER',
                  custodySupplierAmount,
                  supplierLeaf,
                  custodyLeaf,
                  policy.id,
                  journey.id,
                  txRepo,
                ),
              );
            }
          }
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
  ): Promise<LedgerPreviewLine & { debit: Account; credit: Account }> {
    const key = this.idempotencyKey(policyId, journeyId, kind);
    const existing = await txRepo.findOne({ where: { idempotencyKey: key } });
    const rounded = Math.round(amount * 100) / 100;
    return {
      kind,
      amount: rounded,
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
