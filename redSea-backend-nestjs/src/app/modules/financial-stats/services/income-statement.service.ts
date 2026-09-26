import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Account, AccountType, normalBalanceType } from '../../account/account.entity';
import { TransactionLine, EntryType } from '../../transaction-line/transaction-line.entity';
import { TransactionStatus } from '../../transaction/transaction.entity';
import { IncomeStatementQueryDTO } from '../dtos/income-statement-query.dto';
import { accountById, expandIdsWithAncestors, groupByParentId } from '../utils/chart-tree.util';

export interface IncomeStatementLine {
  accountId: number;
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  amount: number;
}

export interface IncomeStatementTreeNode extends IncomeStatementLine {
  children?: IncomeStatementTreeNode[];
}

export interface IncomeStatementReport {
  flat: boolean;
  revenues?: IncomeStatementLine[];
  expenses?: IncomeStatementLine[];
  revenueTree?: IncomeStatementTreeNode[];
  expenseTree?: IncomeStatementTreeNode[];
  dateFrom?: string;
  dateTo?: string;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
}

@Injectable()
export class IncomeStatementService {
  constructor(
    @InjectRepository(TransactionLine)
    private readonly transactionLineRepository: Repository<TransactionLine>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  private rollupAmount(
    self: IncomeStatementLine,
    children: IncomeStatementTreeNode[],
  ): IncomeStatementTreeNode {
    if (children.length === 0) {
      return { ...self, children: undefined };
    }
    const amount = self.amount + children.reduce((s, c) => s + c.amount, 0);
    return { ...self, amount, children };
  }

  private buildIncomeTree(
    expandedAccounts: Account[],
    lineById: Map<number, IncomeStatementLine>,
    expandedIds: Set<number>,
  ): IncomeStatementTreeNode[] {
    const byParent = groupByParentId(expandedAccounts);
    const build = (acc: Account): IncomeStatementTreeNode => {
      const self = lineById.get(acc.id)!;
      const rawKids = byParent.get(acc.id) ?? [];
      const children = rawKids.map((c) => build(c));
      return this.rollupAmount(self, children);
    };
    const roots = expandedAccounts.filter((a) => {
      const p = a.parentAccount?.id;
      return p == null || !expandedIds.has(p);
    });
    roots.sort((a, b) => a.code.localeCompare(b.code));
    return roots.map((r) => build(r));
  }

  async getIncomeStatement(query: IncomeStatementQueryDTO): Promise<IncomeStatementReport> {
    const flat = query.flat === true;

    const qb = this.transactionLineRepository
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
      .andWhere('a.type IN (:...types)', { types: [AccountType.REVENUE, AccountType.EXPENSE] })
      .groupBy('a.id')
      .addGroupBy('a.code')
      .addGroupBy('a.name')
      .addGroupBy('a.type')
      .addGroupBy('a.normalBalance')
      .orderBy('a.type', 'ASC')
      .addOrderBy('a.code', 'ASC');

    if (query.dateFrom) qb.andWhere('t.date >= :dateFrom', { dateFrom: query.dateFrom });
    if (query.dateTo) qb.andWhere('t.date <= :dateTo', { dateTo: query.dateTo });

    const raw = await qb.getRawMany<{
      accountId: string;
      accountCode: string;
      accountName: string;
      accountType: AccountType;
      normalBalance: normalBalanceType;
      totalDebit: string;
      totalCredit: string;
    }>();

    const revenuesFlat: IncomeStatementLine[] = [];
    const expensesFlat: IncomeStatementLine[] = [];
    const seedIds = new Set<number>();

    for (const row of raw) {
      const totalDebit = parseFloat(row.totalDebit);
      const totalCredit = parseFloat(row.totalCredit);
      const amount =
        row.normalBalance === normalBalanceType.CREDIT
          ? totalCredit - totalDebit
          : totalDebit - totalCredit;

      const line: IncomeStatementLine = {
        accountId: +row.accountId,
        accountCode: row.accountCode,
        accountName: row.accountName,
        accountType: row.accountType,
        amount,
      };
      seedIds.add(line.accountId);
      if (row.accountType === AccountType.REVENUE) revenuesFlat.push(line);
      else expensesFlat.push(line);
    }

    const totalRevenue = revenuesFlat.reduce((s, r) => s + r.amount, 0);
    const totalExpenses = expensesFlat.reduce((s, e) => s + e.amount, 0);

    if (raw.length === 0) {
      return {
        flat,
        ...(flat ? { revenues: [], expenses: [] } : { revenueTree: [], expenseTree: [] }),
        dateFrom: query.dateFrom,
        dateTo: query.dateTo,
        totalRevenue: 0,
        totalExpenses: 0,
        netIncome: 0,
      };
    }

    if (flat) {
      return {
        flat: true,
        revenues: revenuesFlat,
        expenses: expensesFlat,
        dateFrom: query.dateFrom,
        dateTo: query.dateTo,
        totalRevenue,
        totalExpenses,
        netIncome: totalRevenue - totalExpenses,
      };
    }

    const plAccounts = await this.accountRepository.find({
      where: { type: In([AccountType.REVENUE, AccountType.EXPENSE]) },
      relations: ['parentAccount'],
      order: { code: 'ASC' },
    });
    const byId = accountById(plAccounts);
    const expandedIds = expandIdsWithAncestors(byId, seedIds);
    const expanded = plAccounts.filter((a) => expandedIds.has(a.id));

    const rawById = new Map(raw.map((r) => [+r.accountId, r]));
    const lineById = new Map<number, IncomeStatementLine>();
    for (const acc of expanded) {
      const fromRaw = rawById.get(acc.id);
      let amount = 0;
      if (fromRaw) {
        const totalDebit = parseFloat(fromRaw.totalDebit);
        const totalCredit = parseFloat(fromRaw.totalCredit);
        amount =
          fromRaw.normalBalance === normalBalanceType.CREDIT
            ? totalCredit - totalDebit
            : totalDebit - totalCredit;
      }
      lineById.set(acc.id, {
        accountId: acc.id,
        accountCode: acc.code,
        accountName: acc.name,
        accountType: acc.type,
        amount,
      });
    }

    const revAccounts = expanded.filter((a) => a.type === AccountType.REVENUE);
    const expAccounts = expanded.filter((a) => a.type === AccountType.EXPENSE);

    return {
      flat: false,
      revenueTree: this.buildIncomeTree(revAccounts, lineById, expandedIds),
      expenseTree: this.buildIncomeTree(expAccounts, lineById, expandedIds),
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      totalRevenue,
      totalExpenses,
      netIncome: totalRevenue - totalExpenses,
    };
  }
}
