import { flattenTreeRows } from '@/lib/export';
import type { ExportColumnDef } from '@/lib/export';
import { createExportColumns } from '@/lib/export/create-columns';

import type { LedgerEntry } from './api/get-general-ledger';
import type { ITrialBalanceLine, ITrialBalanceTreeNode } from './api/get-trial-balance';
import type {
  IIncomeStatementLine,
  IIncomeStatementTreeNode,
} from './api/get-income-statement';
import type { IBalanceSheetLine, IBalanceSheetTreeNode } from './api/get-balance-sheet';

export const formatReportAmount = (amount: number) =>
  new Intl.NumberFormat('en-EG', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

export function generalLedgerExportColumns(
  tTab: (key: string) => string,
): ExportColumnDef<LedgerEntry>[] {
  return createExportColumns<LedgerEntry>([
    { key: 'date', header: tTab('table.date') },
    { key: 'transactionCode', header: tTab('table.reference') },
    { key: 'description', header: tTab('table.description') },
    {
      key: 'debit',
      header: tTab('table.debit'),
      format: (v) => (Number(v) > 0 ? formatReportAmount(Number(v)) : '—'),
    },
    {
      key: 'credit',
      header: tTab('table.credit'),
      format: (v) => (Number(v) > 0 ? formatReportAmount(Number(v)) : '—'),
    },
    {
      key: 'balance',
      header: tTab('table.balance'),
      format: (v) => formatReportAmount(Number(v)),
    },
  ]);
}

export type TrialBalanceExportRow = ITrialBalanceLine & { accountName: string };

function mapTrialNode(
  node: ITrialBalanceTreeNode,
  depth: number,
): { row: TrialBalanceExportRow; children?: ReturnType<typeof mapTrialNode>[] } {
  return {
    row: {
      ...node,
      accountName: `${'  '.repeat(depth)}${node.accountName}`,
    },
    children: node.children?.map((child) => mapTrialNode(child, depth + 1)),
  };
}

export function flattenTrialBalanceTree(nodes: ITrialBalanceTreeNode[]): TrialBalanceExportRow[] {
  return flattenTreeRows(nodes.map((node) => mapTrialNode(node, 0))).map(({ row }) => row);
}

export function trialBalanceExportColumns(
  tTab: (key: string) => string,
): ExportColumnDef<TrialBalanceExportRow>[] {
  return createExportColumns<TrialBalanceExportRow>([
    { key: 'accountCode', header: tTab('table.code') },
    { key: 'accountName', header: tTab('table.account-name') },
    {
      key: 'openingDebit',
      header: `${tTab('table.opening-balance')} (${tTab('table.debit')})`,
      format: (v) => (Number(v) > 0 ? formatReportAmount(Number(v)) : '—'),
    },
    {
      key: 'openingCredit',
      header: `${tTab('table.opening-balance')} (${tTab('table.credit')})`,
      format: (v) => (Number(v) > 0 ? formatReportAmount(Number(v)) : '—'),
    },
    {
      key: 'totalDebit',
      header: `${tTab('table.period-movement')} (${tTab('table.debit')})`,
      format: (v) => (Number(v) > 0 ? formatReportAmount(Number(v)) : '—'),
    },
    {
      key: 'totalCredit',
      header: `${tTab('table.period-movement')} (${tTab('table.credit')})`,
      format: (v) => (Number(v) > 0 ? formatReportAmount(Number(v)) : '—'),
    },
    {
      key: 'closingDebit',
      header: `${tTab('table.closing-balance')} (${tTab('table.debit')})`,
      format: (v) => (Number(v) > 0 ? formatReportAmount(Number(v)) : '—'),
    },
    {
      key: 'closingCredit',
      header: `${tTab('table.closing-balance')} (${tTab('table.credit')})`,
      format: (v) => (Number(v) > 0 ? formatReportAmount(Number(v)) : '—'),
    },
  ]);
}

export function incomeStatementExportColumns(
  tTab: (key: string) => string,
): ExportColumnDef<IIncomeStatementLine & { section: string }>[] {
  return createExportColumns([
    { key: 'section', header: 'القسم' },
    { key: 'accountName', header: 'اسم الحساب' },
    {
      key: 'amount',
      header: 'المبلغ',
      format: (v) => formatReportAmount(Number(v)),
    },
  ]);
}

function flattenIncomeNodes(
  nodes: IIncomeStatementTreeNode[],
  section: string,
  depth = 0,
): Array<IIncomeStatementLine & { section: string }> {
  return flattenTreeRows(
    nodes.map((node) => ({
      row: {
        ...node,
        section,
        accountName: `${'  '.repeat(depth)}${node.accountName}`,
      },
      children: node.children?.map((child) => ({
        row: {
          ...child,
          section,
          accountName: `${'  '.repeat(depth + 1)}${child.accountName}`,
        },
        children: child.children?.map((grand) => ({
          row: {
            ...grand,
            section,
            accountName: `${'  '.repeat(depth + 2)}${grand.accountName}`,
          },
        })),
      })),
    })),
  ).map(({ row }) => row as IIncomeStatementLine & { section: string });
}

export function buildIncomeStatementExportRows(
  data: {
    flat?: boolean;
    revenues?: IIncomeStatementLine[];
    expenses?: IIncomeStatementLine[];
    revenueTree?: IIncomeStatementTreeNode[];
    expenseTree?: IIncomeStatementTreeNode[];
  } | undefined,
  tTab: (key: string) => string,
): Array<IIncomeStatementLine & { section: string }> {
  if (!data) return [];
  const revenueLabel = tTab('revenue');
  const expenseLabel = tTab('expenses');
  if (data.flat) {
    return [
      ...(data.revenues ?? []).map((r) => ({ ...r, section: revenueLabel })),
      ...(data.expenses ?? []).map((e) => ({ ...e, section: expenseLabel })),
    ];
  }
  return [
    ...flattenIncomeNodes(data.revenueTree ?? [], revenueLabel),
    ...flattenIncomeNodes(data.expenseTree ?? [], expenseLabel),
  ];
}

export function balanceSheetExportColumns(
  tTab: (key: string) => string,
): ExportColumnDef<IBalanceSheetLine & { section: string }>[] {
  return createExportColumns([
    { key: 'section', header: 'القسم' },
    { key: 'accountName', header: 'اسم الحساب' },
    {
      key: 'balance',
      header: 'الرصيد',
      format: (v) => formatReportAmount(Number(v)),
    },
  ]);
}

function flattenBalanceNodes(
  nodes: IBalanceSheetTreeNode[],
  section: string,
  depth = 0,
): Array<IBalanceSheetLine & { section: string }> {
  return flattenTreeRows(
    nodes.map((node) => ({
      row: {
        ...node,
        section,
        accountName: `${'  '.repeat(depth)}${node.accountName}`,
      },
      children: node.children?.map((child) => ({
        row: {
          ...child,
          section,
          accountName: `${'  '.repeat(depth + 1)}${child.accountName}`,
        },
      })),
    })),
  ).map(({ row }) => row as IBalanceSheetLine & { section: string });
}

export function buildBalanceSheetExportRows(
  data: {
    flat?: boolean;
    assets?: IBalanceSheetLine[];
    liabilities?: IBalanceSheetLine[];
    equity?: IBalanceSheetLine[];
    assetTree?: IBalanceSheetTreeNode[];
    liabilityTree?: IBalanceSheetTreeNode[];
    equityTree?: IBalanceSheetTreeNode[];
  } | undefined,
  tTab: (key: string) => string,
): Array<IBalanceSheetLine & { section: string }> {
  if (!data) return [];
  if (data.flat) {
    return [
      ...(data.assets ?? []).map((r) => ({ ...r, section: tTab('assets') })),
      ...(data.liabilities ?? []).map((r) => ({ ...r, section: tTab('liabilities') })),
      ...(data.equity ?? []).map((r) => ({ ...r, section: tTab('equity') })),
    ];
  }
  return [
    ...flattenBalanceNodes(data.assetTree ?? [], tTab('assets')),
    ...flattenBalanceNodes(data.liabilityTree ?? [], tTab('liabilities')),
    ...flattenBalanceNodes(data.equityTree ?? [], tTab('equity')),
  ];
}

export function parseGeneralLedgerResponse(
  data: unknown,
  headers: Record<string, string | number | undefined>,
) {
  const ledger = data as { lines?: LedgerEntry[] };
  const lines = ledger?.lines ?? [];
  return {
    items: lines,
    totalCount: Number(headers['x-total-count']) || lines.length,
  };
}
