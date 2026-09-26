import { useGetPaginated } from '@/hooks/base/get-paginated';
import type { IQueryParams } from '@/types/query-params';

import type { TransactionStatus } from '../enums';

export interface ITransactionQueryParams extends IQueryParams {
  status?: TransactionStatus;
  /** Filter: transactions on or after this date (ISO 8601) */
  dateFrom?: string;
  /** Filter: transactions on or before this date (ISO 8601) */
  dateTo?: string;
}

export interface ITransactionLineResponse {
  id: number;
  entryType: 'DEBIT' | 'CREDIT';
  amount: number;
  description?: string;
  account: {
    id: number;
    code: string;
    name: string;
  };
}

export interface ITransactionResponse {
  id: number;
  code: string;
  date: string;
  description: string;
  status: TransactionStatus;
  transactionLines?: ITransactionLineResponse[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ITransactionTableRow {
  id: number;
  code: string;
  date: string;
  description: string;
  status: TransactionStatus;
  linesCount: number;
  totalDebit: number;
  totalCredit: number;
}

export function mapTransactionRow(tx: ITransactionResponse): ITransactionTableRow {
  const lines = tx.transactionLines ?? [];
  const totalDebit = lines
    .filter((l) => l.entryType === 'DEBIT')
    .reduce((sum, l) => sum + Number(l.amount), 0);
  const totalCredit = lines
    .filter((l) => l.entryType === 'CREDIT')
    .reduce((sum, l) => sum + Number(l.amount), 0);

  return {
    id: tx.id,
    code: tx.code,
    date: tx.date ? new Date(tx.date).toLocaleDateString('en-GB') : '—',
    description: tx.description,
    status: tx.status,
    linesCount: lines.length,
    totalDebit,
    totalCredit,
  };
}

export const useGetAllTransactions = (params?: ITransactionQueryParams) => {
  const { data, isPending: isGetTransactionsPending } = useGetPaginated<
    ITransactionResponse,
    ITransactionQueryParams
  >({
    endPoint: '/api/accounting/transactions',
    queryKey: ['accounting-transactions'],
    params,
  });

  const transactions: ITransactionTableRow[] = data?.data?.map(mapTransactionRow) ?? [];
  const totalTransactionsCount = data?.totalCount ?? 0;

  return {
    transactions,
    isGetTransactionsPending,
    totalTransactionsCount,
  };
};
