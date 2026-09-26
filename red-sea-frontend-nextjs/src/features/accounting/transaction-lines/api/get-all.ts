import { useGetPaginated } from '@/hooks/base/get-paginated';
import type { IQueryParams } from '@/types/query-params';

import type { EntryType } from '../enums';

export interface ITransactionLineResponse {
  id: number;
  entryType: EntryType;
  amount: number;
  description?: string;
  transaction: {
    id: number;
    code: string;
  };
  account: {
    id: number;
    code: string;
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ITransactionLineTableRow {
  id: number;
  transactionCode: string;
  accountName: string;
  accountCode: string;
  entryType: EntryType;
  amount: number;
  description: string;
  debit?: number;
  credit?: number;
  date?: string;
  transactionDate?: string;
}

export function mapTransactionLineRow(line: ITransactionLineResponse): ITransactionLineTableRow {
  return {
    id: line.id,
    transactionCode: line.transaction?.code || '—',
    accountName: line.account?.name || '—',
    accountCode: line.account?.code || '—',
    entryType: line.entryType,
    amount: Number(line.amount),
    description: line.description || '—',
  };
}

export const useGetAllTransactionLines = (params?: IQueryParams) => {
  const { data, isPending: isGetLinesPending } = useGetPaginated<
    ITransactionLineResponse,
    IQueryParams
  >({
    endPoint: '/api/accounting/transaction-lines',
    queryKey: ['accounting-transaction-lines'],
    params,
  });

  const transactionLines: ITransactionLineTableRow[] =
    data?.data?.map(mapTransactionLineRow) ?? [];

  const totalLinesCount = data?.totalCount ?? 0;

  return {
    transactionLines,
    isGetLinesPending,
    totalLinesCount,
  };
};
