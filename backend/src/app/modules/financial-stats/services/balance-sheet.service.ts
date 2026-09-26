import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Account, AccountType, normalBalanceType } from '../../account/account.entity';
import { TransactionLine, EntryType } from '../../transaction-line/transaction-line.entity';
import { TransactionStatus } from '../../transaction/transaction.entity';
import { BalanceSheetQueryDTO } from '../dtos/balance-sheet-query.dto';
import { signedBalanceFromTotals, toNumber } from '../utils/signed-balance.util';
import { accountById, expandIdsWithAncestors, groupByParentId } from '../utils/chart-tree.util';

export interface BalanceSheetLine {
  accountId: number;
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  balance: number;
  balancePriorYear?: number;
}

export interface BalanceSheetTreeNode extends BalanceSheetLine {
  children?: BalanceSheetTreeNode[];
}

export interface BalanceSheetReport {
  flat: boolean;
  assets?: BalanceSheetLine[];
  liabilities?: BalanceSheetLine[];
  equity?: BalanceSheetLine[];
  assetTree?: BalanceSheetTreeNode[];
  liabilityTree?: BalanceSheetTreeNode[];
  equityTree?: BalanceSheetTreeNode[];
  asOf: string;
  comparePriorYear: boolean;
  asOfPriorYear?: string;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalAssetsPriorYear?: number;
  totalLiabilitiesPriorYear?: number;
  totalEquityPriorYear?: number;
  isBalanced: boolean;
  isBalancedPriorYear?: boolean;
}

export function priorYearSameCalendarDay(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map((x) => parseInt(x, 10));
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCFullYear(dt.getUTCFullYear() - 1);
  return dt.toISOString().slice(0, 10);
}

type SheetSnapshot = {
  assets: BalanceSheetLine[];
  liabilities: BalanceSheetLine[];
  equity: BalanceSheetLine[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  isBalanced: boolean;
  /** Real accounts only (excludes synthetic NET-INCOME id 0) */
  lineById: Map<number, BalanceSheetLine>;
};

@Injectable()
export class BalanceSheetService {
  constructor(
    @InjectRepository(TransactionLine)
    private readonly transactionLineRepository: Repository<TransactionLine>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  private async netIncomeThrough(asOf: string): Promise<number> {
    const incomeRaw = await this.transactionLineRepository
      .createQueryBuilder('tl')
      .select(
        `COALESCE(SUM(CASE WHEN tl.entryType = '${EntryType.CREDIT}' AND a.type = 'REVENUE' THEN tl.amount ELSE 0 END), 0)`,
        'totalRevenue',
      )
      .addSelect(
        `COALESCE(SUM(CASE WHEN tl.entryType = '${EntryType.DEBIT}'  AND a.type = 'EXPENSE' THEN tl.amount ELSE 0 END), 0)`,
        'totalExpenses',
      )
      .innerJoin('tl.transaction', 't')
      .innerJoin('tl.account', 'a')
      .where('t.status = :status', { status: TransactionStatus.POSTED })
      .andWhere('t.date <= :asOf', { asOf })
      .andWhere('a.type IN (:...incTypes)', {
        incTypes: [AccountType.REVENUE, AccountType.EXPENSE],
      })
      .getRawOne<{ totalRevenue: string; totalExpenses: string }>();

    return parseFloat(incomeRaw?.totalRevenue ?? '0') - parseFloat(incomeRaw?.totalExpenses ?? '0');
  }

  private async buildSnapshot(asOf: string): Promise<SheetSnapshot> {
    const raw = await this.transactionLineRepository
      .createQueryBuilder('tl')
      .select('a.id', 'accountId')
      .addSelect('a.code', 'accountCode')
      .addSelect('a.name', 'accountName')
      .addSelect('a.type', 'accountType')
      .addSelect('a.normalBalance', 'normalBalance')
      .addSelect('MAX(a.opening_balance)', 'openingBalance')
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
      .andWhere('t.date <= :asOf', { asOf })
      .andWhere('a.type IN (:...types)', {
        types: [AccountType.ASSET, AccountType.CASH, AccountType.LIABILITY, AccountType.EQUITY],
      })
      .groupBy('a.id')
      .addGroupBy('a.code')
      .addGroupBy('a.name')
      .addGroupBy('a.type')
      .addGroupBy('a.normalBalance')
      .orderBy('a.type', 'ASC')
      .addOrderBy('a.code', 'ASC')
      .getRawMany<{
        accountId: string;
        accountCode: string;
        accountName: string;
        accountType: AccountType;
        normalBalance: normalBalanceType;
        openingBalance: string;
        totalDebit: string;
        totalCredit: string;
      }>();

    const seenIds = new Set<number>();
    const assets: BalanceSheetLine[] = [];
    const liabilities: BalanceSheetLine[] = [];
    const equity: BalanceSheetLine[] = [];
    const lineById = new Map<number, BalanceSheetLine>();

    const pushLine = (
      row: {
        accountId: number;
        accountCode: string;
        accountName: string;
        accountType: AccountType;
        balance: number;
      },
      rowType: AccountType,
    ) => {
      const line: BalanceSheetLine = {
        accountId: row.accountId,
        accountCode: row.accountCode,
        accountName: row.accountName,
        accountType: row.accountType === AccountType.CASH ? AccountType.ASSET : row.accountType,
        balance: row.balance,
      };
      if (row.accountId > 0) {
        lineById.set(row.accountId, { ...line });
      }
      if (rowType === AccountType.ASSET || rowType === AccountType.CASH) {
        assets.push(line);
      } else if (rowType === AccountType.LIABILITY) {
        liabilities.push(line);
      } else {
        equity.push(line);
      }
    };

    for (const row of raw) {
      const id = +row.accountId;
      seenIds.add(id);
      const totalDebit = parseFloat(row.totalDebit);
      const totalCredit = parseFloat(row.totalCredit);
      const openingFromDb = toNumber(row.openingBalance);
      const postingSigned = signedBalanceFromTotals(totalDebit, totalCredit, row.normalBalance);
      const balance = openingFromDb + postingSigned;
      pushLine(
        {
          accountId: id,
          accountCode: row.accountCode,
          accountName: row.accountName,
          accountType: row.accountType === AccountType.CASH ? AccountType.ASSET : row.accountType,
          balance,
        },
        row.accountType,
      );
    }

    const openingOnly = await this.accountRepository
      .createQueryBuilder('a')
      .where('a.opening_balance <> 0')
      .andWhere('a.type IN (:...types)', {
        types: [AccountType.ASSET, AccountType.CASH, AccountType.LIABILITY, AccountType.EQUITY],
      })
      .andWhere('a.id NOT IN (:...ids)', { ids: seenIds.size > 0 ? [...seenIds] : [-1] })
      .getMany();

    for (const a of openingOnly) {
      const bal = toNumber(a.openingBalance);
      pushLine(
        {
          accountId: a.id,
          accountCode: a.code,
          accountName: a.name,
          accountType: a.type === AccountType.CASH ? AccountType.ASSET : a.type,
          balance: bal,
        },
        a.type,
      );
    }

    const netIncome = await this.netIncomeThrough(asOf);
    if (netIncome !== 0) {
      equity.push({
        accountId: 0,
        accountCode: 'NET-INCOME',
        accountName: 'صافي الدخل (أرباح / خسائر السنة)',
        accountType: AccountType.EQUITY,
        balance: netIncome,
      });
    }

    const totalAssets = assets.reduce((s, a) => s + a.balance, 0);
    const totalLiabilities = liabilities.reduce((s, l) => s + l.balance, 0);
    const totalEquity = equity.reduce((s, e) => s + e.balance, 0);
    const isBalanced = Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01;

    return {
      assets,
      liabilities,
      equity,
      totalAssets,
      totalLiabilities,
      totalEquity,
      isBalanced,
      lineById,
    };
  }

  private mergeSnapshots(current: SheetSnapshot, prior: SheetSnapshot): SheetSnapshot {
    const priorAssetMap = new Map(prior.assets.map((l) => [l.accountId, l.balance]));
    const priorLiabMap = new Map(prior.liabilities.map((l) => [l.accountId, l.balance]));
    const priorEqMap = new Map(prior.equity.map((l) => [l.accountId, l.balance]));

    const mergeLine = (l: BalanceSheetLine, m: Map<number, number>): BalanceSheetLine => ({
      ...l,
      balancePriorYear: m.get(l.accountId) ?? 0,
    });

    const assets = current.assets.map((l) => mergeLine(l, priorAssetMap));
    const liabilities = current.liabilities.map((l) => mergeLine(l, priorLiabMap));
    const equity = current.equity.map((l) => mergeLine(l, priorEqMap));

    const lineById = new Map<number, BalanceSheetLine>();
    for (const l of [...assets, ...liabilities, ...equity]) {
      if (l.accountId > 0) lineById.set(l.accountId, l);
    }

    return {
      assets,
      liabilities,
      equity,
      totalAssets: current.totalAssets,
      totalLiabilities: current.totalLiabilities,
      totalEquity: current.totalEquity,
      isBalanced: current.isBalanced,
      lineById,
    };
  }

  private rollupBs(self: BalanceSheetLine, children: BalanceSheetTreeNode[]): BalanceSheetTreeNode {
    if (children.length === 0) {
      return { ...self, children: undefined };
    }
    const balance = self.balance + children.reduce((s, c) => s + c.balance, 0);
    const hasPrior =
      self.balancePriorYear !== undefined || children.some((c) => c.balancePriorYear !== undefined);
    const balancePriorYear = hasPrior
      ? (self.balancePriorYear ?? 0) + children.reduce((s, c) => s + (c.balancePriorYear ?? 0), 0)
      : undefined;
    return {
      ...self,
      balance,
      ...(balancePriorYear !== undefined ? { balancePriorYear } : {}),
      children,
    };
  }

  private buildBsSectionTree(
    sectionLines: BalanceSheetLine[],
    sectionAccounts: Account[],
    lineById: Map<number, BalanceSheetLine>,
    expandedIds: Set<number>,
    comparePriorYear: boolean,
  ): BalanceSheetTreeNode[] {
    const byParent = groupByParentId(sectionAccounts);
    const zeroLine = (acc: Account): BalanceSheetLine => ({
      accountId: acc.id,
      accountCode: acc.code,
      accountName: acc.name,
      accountType: acc.type === AccountType.CASH ? AccountType.ASSET : acc.type,
      balance: 0,
      ...(comparePriorYear ? { balancePriorYear: 0 } : {}),
    });

    const build = (acc: Account): BalanceSheetTreeNode => {
      const self = lineById.get(acc.id) ?? zeroLine(acc);
      const rawKids = byParent.get(acc.id) ?? [];
      const children = rawKids.map((c) => build(c));
      return this.rollupBs(self, children);
    };

    const roots = sectionAccounts.filter((a) => {
      const p = a.parentAccount?.id;
      return p == null || !expandedIds.has(p);
    });
    roots.sort((a, b) => a.code.localeCompare(b.code));
    return roots.map((r) => build(r));
  }

  async getBalanceSheet(query: BalanceSheetQueryDTO): Promise<BalanceSheetReport> {
    const asOf = query.asOf ?? new Date().toISOString().split('T')[0];
    const comparePriorYear = query.comparePriorYear === true;
    const flat = query.flat === true;

    const current = await this.buildSnapshot(asOf);

    if (!comparePriorYear) {
      if (flat) {
        return {
          flat: true,
          asOf,
          comparePriorYear: false,
          assets: current.assets,
          liabilities: current.liabilities,
          equity: current.equity,
          totalAssets: current.totalAssets,
          totalLiabilities: current.totalLiabilities,
          totalEquity: current.totalEquity,
          isBalanced: current.isBalanced,
        };
      }
      const trees = await this.buildTreesFromSnapshotPublic(current, comparePriorYear);
      return {
        flat: false,
        asOf,
        comparePriorYear: false,
        ...trees,
        totalAssets: current.totalAssets,
        totalLiabilities: current.totalLiabilities,
        totalEquity: current.totalEquity,
        isBalanced: current.isBalanced,
      };
    }

    const asOfPriorYear = priorYearSameCalendarDay(asOf);
    const prior = await this.buildSnapshot(asOfPriorYear);
    const merged = this.mergeSnapshots(current, prior);

    if (flat) {
      return {
        flat: true,
        asOf,
        comparePriorYear: true,
        asOfPriorYear,
        assets: merged.assets,
        liabilities: merged.liabilities,
        equity: merged.equity,
        totalAssets: merged.totalAssets,
        totalLiabilities: merged.totalLiabilities,
        totalEquity: merged.totalEquity,
        totalAssetsPriorYear: prior.totalAssets,
        totalLiabilitiesPriorYear: prior.totalLiabilities,
        totalEquityPriorYear: prior.totalEquity,
        isBalanced: merged.isBalanced,
        isBalancedPriorYear: prior.isBalanced,
      };
    }

    const trees = await this.buildTreesFromSnapshotPublic(merged, true);
    return {
      flat: false,
      asOf,
      comparePriorYear: true,
      asOfPriorYear,
      ...trees,
      totalAssets: merged.totalAssets,
      totalLiabilities: merged.totalLiabilities,
      totalEquity: merged.totalEquity,
      totalAssetsPriorYear: prior.totalAssets,
      totalLiabilitiesPriorYear: prior.totalLiabilities,
      totalEquityPriorYear: prior.totalEquity,
      isBalanced: merged.isBalanced,
      isBalancedPriorYear: prior.isBalanced,
    };
  }

  /** Async tree builder (public wrapper to avoid IIFE typing issues). */
  private async buildTreesFromSnapshotPublic(
    snap: SheetSnapshot,
    comparePriorYear: boolean,
  ): Promise<{
    assetTree: BalanceSheetTreeNode[];
    liabilityTree: BalanceSheetTreeNode[];
    equityTree: BalanceSheetTreeNode[];
  }> {
    const seedIds = new Set<number>();
    for (const l of [...snap.assets, ...snap.liabilities, ...snap.equity]) {
      if (l.accountId > 0) seedIds.add(l.accountId);
    }

    const accounts = await this.accountRepository.find({
      where: {
        type: In([AccountType.ASSET, AccountType.CASH, AccountType.LIABILITY, AccountType.EQUITY]),
      },
      relations: ['parentAccount'],
      order: { code: 'ASC' },
    });
    const byId = accountById(accounts);
    const expandedIds = expandIdsWithAncestors(byId, seedIds);
    const expanded = accounts.filter((a) => expandedIds.has(a.id));

    for (const acc of expanded) {
      if (!snap.lineById.has(acc.id)) {
        snap.lineById.set(
          acc.id,
          comparePriorYear
            ? {
                accountId: acc.id,
                accountCode: acc.code,
                accountName: acc.name,
                accountType: acc.type === AccountType.CASH ? AccountType.ASSET : acc.type,
                balance: 0,
                balancePriorYear: 0,
              }
            : {
                accountId: acc.id,
                accountCode: acc.code,
                accountName: acc.name,
                accountType: acc.type === AccountType.CASH ? AccountType.ASSET : acc.type,
                balance: 0,
              },
        );
      }
    }

    const assetAccounts = expanded.filter(
      (a) => a.type === AccountType.ASSET || a.type === AccountType.CASH,
    );
    const liabAccounts = expanded.filter((a) => a.type === AccountType.LIABILITY);
    const eqAccounts = expanded.filter((a) => a.type === AccountType.EQUITY);

    const assetTree = this.buildBsSectionTree(
      snap.assets,
      assetAccounts,
      snap.lineById,
      expandedIds,
      comparePriorYear,
    );
    const liabilityTree = this.buildBsSectionTree(
      snap.liabilities,
      liabAccounts,
      snap.lineById,
      expandedIds,
      comparePriorYear,
    );
    const equityTree = this.buildBsSectionTree(
      snap.equity.filter((l) => l.accountId > 0),
      eqAccounts,
      snap.lineById,
      expandedIds,
      comparePriorYear,
    );
    const synthetic = snap.equity.find((l) => l.accountId === 0);
    if (synthetic) {
      equityTree.push({ ...synthetic, children: undefined });
    }

    return { assetTree, liabilityTree, equityTree };
  }
}
