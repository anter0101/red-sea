import { createExportColumns } from '@/lib/export/create-columns';
import type { ExportColumnDef } from '@/lib/export';

import { TripTransactionCategoryLabels } from './components/transactions-table';

export interface IJourneyTransactionApi {
  createdAt?: string;
  category: string;
  amount: number;
  transactionType: 'EXPENSE' | 'REVENUE' | 'ADVANCED';
}

export interface ITripActivityExportRow {
  dateTime: string;
  category: string;
  amount: string;
  transactionType: string;
}

export function mapTripTransactionRow(item: IJourneyTransactionApi): ITripActivityExportRow {
  return {
    dateTime: item.createdAt ? new Date(item.createdAt).toLocaleString() : '—',
    category: TripTransactionCategoryLabels[item.category] || item.category || '—',
    amount: item.amount !== undefined ? item.amount.toLocaleString() : '—',
    transactionType: item.transactionType ?? '—',
  };
}

export function tripTransactionsExportColumns(): ExportColumnDef<ITripActivityExportRow>[] {
  return createExportColumns<ITripActivityExportRow>([
    { key: 'dateTime', header: 'التاريخ والوقت' },
    { key: 'category', header: 'النشاط' },
    { key: 'amount', header: 'المبلغ' },
    { key: 'transactionType', header: 'نوع المعاملة' },
  ]);
}
