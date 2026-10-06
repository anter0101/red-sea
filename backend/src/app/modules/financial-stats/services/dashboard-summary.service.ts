import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountSystemKey } from '../../account/account-system-keys';
import { Account, normalBalanceType } from '../../account/account.entity';
import { TransactionLine, EntryType } from '../../transaction-line/transaction-line.entity';
import { TransactionStatus } from '../../transaction/transaction.entity';
import { DateRangeDTO } from '../dtos/date-range.dto';
import { signedBalanceFromTotals, toNumber } from '../utils/signed-balance.util';
import { IncomeStatementService } from './income-statement.service';

export interface AccountingDashboard {
  revenue: number;
  cost: number;
  netProfit: number;
  clients: number;
  suppliers: number;
}

type ChartNode = {
  id: number;
  openingBalance: number;
  normalBalance: normalBalanceType;
  parentId: number | null;
};

@Injectable()
export class DashboardSummaryService {
  constructor(
    private readonly incomeStatementService: IncomeStatementService,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(TransactionLine)
    private readonly transactionLineRepository: Repository<TransactionLine>,
  ) {}

  async getSummary(query: DateRangeDTO): Promise<AccountingDashboard> {
    const dateFrom = query.dateFrom?.slice(0, 10);
    const dateTo = query.dateTo ? `${query.dateTo.slice(0, 10)}T23:59:59.999Z` : undefined;
    const income = await this.incomeStatementService.getIncomeStatement({
      dateFrom,
      dateTo,
      flat: true,
    });
    const clients = await this.closingBalance([AccountSystemKey.CLIENTS], dateTo);
    const suppliers = await this.closingBalance(
      [AccountSystemKey.TRANSPORT_SUPPLIER, AccountSystemKey.CUSTODY_SUPPLIER],
      dateTo,
    );
    return {
      revenue: roundMoney(income.totalRevenue),
      cost: roundMoney(income.totalExpenses),
      netProfit: roundMoney(income.netIncome),
      clients,
      suppliers,
    };
  }

  /** Sum of leaf closing balances under the seeded parents. Parents themselves are not added twice. */
  private async closingBalance(keys: AccountSystemKey[], dateTo?: string): Promise<number> {
    const accounts = await this.accountRepository
      .createQueryBuilder('a')
      .leftJoin('a.parentAccount', 'parent')
      .select('a.id', 'id')
      .addSelect('a.openingBalance', 'openingBalance')
      .addSelect('a.normalBalance', 'normalBalance')
      .addSelect('a.systemKey', 'systemKey')
      .addSelect('parent.id', 'parentId')
      .getRawMany<{
        id: string;
        openingBalance: string;
        normalBalance: normalBalanceType;
        systemKey: string | null;
        parentId: string | null;
      }>();

    const nodes = new Map<number, ChartNode>();
    const children = new Map<number, number[]>();
    for (const row of accounts) {
      const id = Number(row.id);
      const parentId = row.parentId == null ? null : Number(row.parentId);
      nodes.set(id, {
        id,
        openingBalance: toNumber(row.openingBalance),
        normalBalance: row.normalBalance,
        parentId,
      });
      if (parentId != null) {
        const list = children.get(parentId) ?? [];
        list.push(id);
        children.set(parentId, list);
      }
    }

    const leaves: ChartNode[] = [];
    const visit = (id: number) => {
      const kids = children.get(id) ?? [];
      if (kids.length === 0) {
        const node = nodes.get(id);
        if (node) leaves.push(node);
        return;
      }
      for (const kid of kids) visit(kid);
    };
    for (const row of accounts) {
      if (row.systemKey && keys.includes(row.systemKey as AccountSystemKey)) {
        visit(Number(row.id));
      }
    }
    if (leaves.length === 0) return 0;

    const ids = leaves.map((leaf) => leaf.id);
    const qb = this.transactionLineRepository
      .createQueryBuilder('tl')
      .innerJoin('tl.account', 'a')
      .select('a.id', 'accountId')
      .addSelect(
        `COALESCE(SUM(CASE WHEN tl.entryType = '${EntryType.DEBIT}' THEN tl.amount ELSE 0 END), 0)`,
        'totalDebit',
      )
      .addSelect(
        `COALESCE(SUM(CASE WHEN tl.entryType = '${EntryType.CREDIT}' THEN tl.amount ELSE 0 END), 0)`,
        'totalCredit',
      )
      .innerJoin('tl.transaction', 't')
      .where('t.status = :status', { status: TransactionStatus.POSTED })
      .andWhere('a.id IN (:...ids)', { ids })
      .groupBy('a.id');
    if (dateTo) qb.andWhere('t.date <= :dateTo', { dateTo });

    const posted = await qb.getRawMany<{
      accountId: string;
      totalDebit: string;
      totalCredit: string;
    }>();
    const movement = new Map<number, { debit: number; credit: number }>();
    for (const row of posted) {
      movement.set(Number(row.accountId), {
        debit: toNumber(row.totalDebit),
        credit: toNumber(row.totalCredit),
      });
    }

    const total = leaves.reduce((sum, leaf) => {
      const move = movement.get(leaf.id) ?? { debit: 0, credit: 0 };
      const signed = signedBalanceFromTotals(move.debit, move.credit, leaf.normalBalance);
      return sum + leaf.openingBalance + signed;
    }, 0);
    return roundMoney(total);
  }
}

function roundMoney(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100) / 100;
}
