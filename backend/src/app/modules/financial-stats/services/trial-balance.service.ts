import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account, AccountType, normalBalanceType } from '../../account/account.entity';
import { TransactionLine, EntryType } from '../../transaction-line/transaction-line.entity';
import { TransactionStatus } from '../../transaction/transaction.entity';
import { TrialBalanceQueryDTO } from '../dtos/trial-balance-query.dto';
import {
  signedBalanceFromTotals,
  splitSignedToDebitCreditColumns,
  toNumber,
} from '../utils/signed-balance.util';
import { accountById, expandIdsWithAncestors, groupByParentId } from '../utils/chart-tree.util';

type AggRow = {
  accountId: number;
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  normalBalance: normalBalanceType;
  totalDebit: number;
  totalCredit: number;
};

export interface TrialBalanceLine {
  accountId: number;
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  normalBalance: normalBalanceType;
  totalDebit: number;
  totalCredit: number;
  balance: number;
  openingBalance: number;
  openingDebit: number;
  openingCredit: number;
  closingBalance: number;
  closingDebit: number;
  closingCredit: number;
}

export interface TrialBalanceTreeNode extends TrialBalanceLine {
  children?: TrialBalanceTreeNode[];
}

export interface TrialBalanceReport {
  flat: boolean;
  lines?: TrialBalanceLine[];
  tree?: TrialBalanceTreeNode[];
  dateFrom?: string;
  dateTo?: string;
  grandTotalDebit: number;
  grandTotalCredit: number;
  grandOpeningDebit: number;
  grandOpeningCredit: number;
  isBalanced: boolean;
}

@Injectable()
export class TrialBalanceService {
  constructor(
    @InjectRepository(TransactionLine)
    private readonly transactionLineRepository: Repository<TransactionLine>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  private buildAggregateQuery() {
    return this.transactionLineRepository
      .createQueryBuilder('tl')
      .select('a.id', 'accountId')
      .addSelect('a.code', 'accountCode')
      .addSelect('a.name', 'accountName')
      .addSelect('a.type', 'accountType')
      .addSelect('a.normalBalance', 'normalBalance')
      .addSelect(
        `COALESCE(SUM(CASE WHEN tl.entryType = '${EntryType.DEBIT}' THEN tl.amount ELSE 0 END), 0)`,
        'totalDebit',
      )
      .addSelect(
        `COALESCE(SUM(CASE WHEN tl.entryType = '${EntryType.CREDIT}' THEN tl.amount ELSE 0 END), 0)`,
        'totalCredit',
      )
      .innerJoin('tl.transaction', 't')
      .innerJoin('tl.account', 'a')
      .where('t.status = :status', { status: TransactionStatus.POSTED })
      .groupBy('a.id')
      .addGroupBy('a.code')
      .addGroupBy('a.name')
      .addGroupBy('a.type')
      .addGroupBy('a.normalBalance');
  }

  private mapRawToAgg(
    raw: Array<{
      accountId: string;
      accountCode: string;
      accountName: string;
      accountType: AccountType;
      normalBalance: normalBalanceType;
      totalDebit: string;
      totalCredit: string;
    }>,
  ): Map<number, AggRow> {
    const m = new Map<number, AggRow>();
    for (const row of raw) {
      m.set(+row.accountId, {
        accountId: +row.accountId,
        accountCode: row.accountCode,
        accountName: row.accountName,
        accountType: row.accountType,
        normalBalance: row.normalBalance,
        totalDebit: parseFloat(row.totalDebit),
        totalCredit: parseFloat(row.totalCredit),
      });
    }
    return m;
  }

  private lineForAccount(
    acc: Account,
    periodMap: Map<number, AggRow>,
    priorMap: Map<number, AggRow>,
  ): TrialBalanceLine {
    const period = periodMap.get(acc.id);
    const prior = priorMap.get(acc.id);
    const totalDebit = period?.totalDebit ?? 0;
    const totalCredit = period?.totalCredit ?? 0;
    // P1: parent/header rows do not use stored opening_balance; roll-up comes from descendants.
    const storedOpening = acc.isLeaf === true ? toNumber(acc.openingBalance) : 0;
    const priorSigned = prior
      ? signedBalanceFromTotals(prior.totalDebit, prior.totalCredit, acc.normalBalance)
      : 0;
    const openingBalance = storedOpening + priorSigned;
    const { debit: openingDebit, credit: openingCredit } = splitSignedToDebitCreditColumns(
      openingBalance,
      acc.normalBalance,
    );
    const periodSigned = signedBalanceFromTotals(totalDebit, totalCredit, acc.normalBalance);
    const closingBalance = openingBalance + periodSigned;
    const { debit: closingDebit, credit: closingCredit } = splitSignedToDebitCreditColumns(
      closingBalance,
      acc.normalBalance,
    );
    return {
      accountId: acc.id,
      accountCode: acc.code,
      accountName: acc.name,
      accountType: acc.type,
      normalBalance: acc.normalBalance,
      totalDebit,
      totalCredit,
      balance: periodSigned,
      openingBalance,
      openingDebit,
      openingCredit,
      closingBalance,
      closingDebit,
      closingCredit,
    };
  }

  private rollupTbNode(
    acc: Account,
    self: TrialBalanceLine,
    children: TrialBalanceTreeNode[],
  ): TrialBalanceTreeNode {
    if (children.length === 0) {
      return { ...self, children: undefined };
    }
    const nb = acc.normalBalance;
    const totalDebit = self.totalDebit + children.reduce((s, c) => s + c.totalDebit, 0);
    const totalCredit = self.totalCredit + children.reduce((s, c) => s + c.totalCredit, 0);
    const balance = signedBalanceFromTotals(totalDebit, totalCredit, nb);
    const openingBalance = self.openingBalance + children.reduce((s, c) => s + c.openingBalance, 0);
    const closingBalance = openingBalance + balance;
    const { debit: openingDebit, credit: openingCredit } = splitSignedToDebitCreditColumns(
      openingBalance,
      nb,
    );
    const { debit: closingDebit, credit: closingCredit } = splitSignedToDebitCreditColumns(
      closingBalance,
      nb,
    );
    return {
      accountId: self.accountId,
      accountCode: self.accountCode,
      accountName: self.accountName,
      accountType: self.accountType,
      normalBalance: nb,
      totalDebit,
      totalCredit,
      balance,
      openingBalance,
      openingDebit,
      openingCredit,
      closingBalance,
      closingDebit,
      closingCredit,
      children,
    };
  }

  private buildTbTree(
    expandedAccounts: Account[],
    lineById: Map<number, TrialBalanceLine>,
    expandedIds: Set<number>,
  ): TrialBalanceTreeNode[] {
    const byParent = groupByParentId(expandedAccounts);
    const build = (acc: Account): TrialBalanceTreeNode => {
      const self = lineById.get(acc.id)!;
      const rawKids = byParent.get(acc.id) ?? [];
      const children = rawKids.map((c) => build(c));
      return this.rollupTbNode(acc, self, children);
    };
    const roots = expandedAccounts.filter((a) => {
      const p = a.parentAccount?.id;
      return p == null || !expandedIds.has(p);
    });
    roots.sort((a, b) => a.code.localeCompare(b.code));
    return roots.map((r) => build(r));
  }

  async getTrialBalance(query: TrialBalanceQueryDTO): Promise<TrialBalanceReport> {
    const flat = query.flat === true;

    const periodQb = this.buildAggregateQuery().orderBy('a.code', 'ASC');
    if (query.dateFrom) periodQb.andWhere('t.date >= :dateFrom', { dateFrom: query.dateFrom });
    if (query.dateTo) periodQb.andWhere('t.date <= :dateTo', { dateTo: query.dateTo });

    const periodRaw = await periodQb.getRawMany<{
      accountId: string;
      accountCode: string;
      accountName: string;
      accountType: AccountType;
      normalBalance: normalBalanceType;
      totalDebit: string;
      totalCredit: string;
    }>();
    const periodMap = this.mapRawToAgg(periodRaw);

    let priorMap = new Map<number, AggRow>();
    if (query.dateFrom) {
      const priorQb = this.buildAggregateQuery().andWhere('t.date < :dateFrom', {
        dateFrom: query.dateFrom,
      });
      const priorRaw = await priorQb.getRawMany<{
        accountId: string;
        accountCode: string;
        accountName: string;
        accountType: AccountType;
        normalBalance: normalBalanceType;
        totalDebit: string;
        totalCredit: string;
      }>();
      priorMap = this.mapRawToAgg(priorRaw);
    }

    const idSet = new Set<number>([...periodMap.keys(), ...priorMap.keys()]);

    const openingOnly = await this.accountRepository
      .createQueryBuilder('a')
      .where('a.opening_balance <> 0')
      .getMany();
    for (const a of openingOnly) {
      idSet.add(a.id);
    }

    let grandTotalDebit = 0;
    let grandTotalCredit = 0;
    let grandOpeningDebit = 0;
    let grandOpeningCredit = 0;

    if (idSet.size === 0) {
      return {
        flat,
        ...(flat ? { lines: [] } : { tree: [] }),
        dateFrom: query.dateFrom,
        dateTo: query.dateTo,
        grandTotalDebit: 0,
        grandTotalCredit: 0,
        grandOpeningDebit: 0,
        grandOpeningCredit: 0,
        isBalanced: true,
      };
    }

    const allAccounts = await this.accountRepository.find({
      relations: ['parentAccount'],
      order: { code: 'ASC' },
    });
    const byId = accountById(allAccounts);
    const expandedIds = expandIdsWithAncestors(byId, idSet);
    const expandedAccounts = allAccounts.filter((a) => expandedIds.has(a.id));

    const lines: TrialBalanceLine[] = [];
    const lineById = new Map<number, TrialBalanceLine>();

    for (const acc of expandedAccounts) {
      const line = this.lineForAccount(acc, periodMap, priorMap);
      lineById.set(acc.id, line);
      lines.push(line);
      const period = periodMap.get(acc.id);
      if (period) {
        grandTotalDebit += period.totalDebit;
        grandTotalCredit += period.totalCredit;
      }
      grandOpeningDebit += line.openingDebit;
      grandOpeningCredit += line.openingCredit;
    }

    const base = {
      flat,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      grandTotalDebit,
      grandTotalCredit,
      grandOpeningDebit,
      grandOpeningCredit,
      isBalanced: Math.abs(grandTotalDebit - grandTotalCredit) < 0.01,
    };

    if (flat) {
      return { ...base, lines };
    }
    return {
      ...base,
      tree: this.buildTbTree(expandedAccounts, lineById, expandedIds),
    };
  }
}
