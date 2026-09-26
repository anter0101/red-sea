import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account, normalBalanceType } from '../../account/account.entity';
import { TransactionLine, EntryType } from '../../transaction-line/transaction-line.entity';
import { TransactionStatus } from '../../transaction/transaction.entity';
import { LedgerQueryDTO } from '../dtos/ledger-query.dto';
import { toNumber } from '../utils/signed-balance.util';

export interface LedgerEntry {
  date: Date;
  transactionCode: string;
  description: string;
  debit: number;
  credit: number;
  /** Running balance after this entry (sign follows the account's normal balance) */
  balance: number;
}

export interface LedgerReport {
  account: {
    id: number;
    code: string;
    name: string;
    type: string;
    normalBalance: string;
  };
  dateFrom?: string;
  dateTo?: string;
  openingBalance: number;
  /** Paginated entries for the current page */
  lines: LedgerEntry[];
  /** Running balance at the last entry on the current page */
  closingBalance: number;
  /** Sum of all debits in the full period */
  periodTotalDebits: number;
  /** Sum of all credits in the full period */
  periodTotalCredits: number;
  /** Running balance at the very end of the full period */
  periodClosingBalance: number;
  /** Total number of entries in the period — used by the controller for pagination headers */
  total: number;
}

@Injectable()
export class LedgerService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,

    @InjectRepository(TransactionLine)
    private readonly transactionLineRepository: Repository<TransactionLine>,
  ) {}

  async getLedger(query: LedgerQueryDTO): Promise<LedgerReport> {
    const account = await this.accountRepository.findOne({ where: { id: query.accountId } });
    if (!account) throw new NotFoundException(`Account ${query.accountId} not found`);

    const isDebitNormal = account.normalBalance === normalBalanceType.DEBIT;
    const storedOpening = toNumber(account.openingBalance);

    // ── Opening: stored opening balance + POSTED lines strictly before dateFrom ─
    // When no dateFrom is supplied, only the stored opening applies (no "prior postings" slice).
    let postingBeforePeriod = 0;
    if (query.dateFrom) {
      const openingRaw = await this.transactionLineRepository
        .createQueryBuilder('tl')
        .select(
          `COALESCE(SUM(CASE WHEN tl.entryType = '${EntryType.DEBIT}' THEN tl.amount ELSE 0 END), 0)`,
          'totalDebit',
        )
        .addSelect(
          `COALESCE(SUM(CASE WHEN tl.entryType = '${EntryType.CREDIT}' THEN tl.amount ELSE 0 END), 0)`,
          'totalCredit',
        )
        .innerJoin('tl.transaction', 't')
        .where('tl.account = :accountId', { accountId: query.accountId })
        .andWhere('t.status = :status', { status: TransactionStatus.POSTED })
        .andWhere('t.date < :dateFrom', { dateFrom: query.dateFrom })
        .getRawOne<{ totalDebit: string; totalCredit: string }>();

      const openingDebit = parseFloat(openingRaw?.totalDebit ?? '0');
      const openingCredit = parseFloat(openingRaw?.totalCredit ?? '0');
      postingBeforePeriod = isDebitNormal
        ? openingDebit - openingCredit
        : openingCredit - openingDebit;
    }

    const openingBalance = storedOpening + postingBeforePeriod;

    // ── Fetch ALL period lines (needed to compute running balances correctly) ─
    const linesQb = this.transactionLineRepository
      .createQueryBuilder('tl')
      .innerJoinAndSelect('tl.transaction', 't')
      .where('tl.account = :accountId', { accountId: query.accountId })
      .andWhere('t.status = :status', { status: TransactionStatus.POSTED })
      .orderBy('t.date', 'ASC')
      .addOrderBy('t.id', 'ASC')
      .addOrderBy('tl.id', 'ASC');

    if (query.dateFrom) linesQb.andWhere('t.date >= :dateFrom', { dateFrom: query.dateFrom });
    if (query.dateTo) linesQb.andWhere('t.date <= :dateTo', { dateTo: query.dateTo });

    const allLines = await linesQb.getMany();

    // ── Build running-balance entries across the full dataset ─────────────────
    let runningBalance = openingBalance;
    let periodTotalDebits = 0;
    let periodTotalCredits = 0;

    const allEntries: LedgerEntry[] = allLines.map((line) => {
      const debit = line.entryType === EntryType.DEBIT ? +line.amount : 0;
      const credit = line.entryType === EntryType.CREDIT ? +line.amount : 0;
      periodTotalDebits += debit;
      periodTotalCredits += credit;
      runningBalance += isDebitNormal ? debit - credit : credit - debit;

      return {
        date: line.transaction.date,
        transactionCode: line.transaction.code,
        description: line.description ?? line.transaction.description,
        debit,
        credit,
        balance: runningBalance,
      };
    });

    const periodClosingBalance = runningBalance;
    const total = allEntries.length;

    // ── Apply pagination slice ────────────────────────────────────────────────
    const page = Math.max(1, +(query.page ?? 1));
    const pageSize = Math.max(1, +(query.pageSize ?? 10));
    const entries = allEntries.slice((page - 1) * pageSize, page * pageSize);
    const closingBalance =
      entries.length > 0
        ? entries[entries.length - 1].balance
        : page > 1
          ? (allEntries[(page - 1) * pageSize - 1]?.balance ?? openingBalance)
          : openingBalance;

    return {
      account: {
        id: account.id,
        code: account.code,
        name: account.name,
        type: account.type,
        normalBalance: account.normalBalance,
      },
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      openingBalance,
      lines: entries,
      closingBalance,
      periodTotalDebits,
      periodTotalCredits,
      periodClosingBalance,
      total,
    };
  }
}
