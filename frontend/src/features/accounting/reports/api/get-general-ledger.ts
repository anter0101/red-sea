import client from '@/lib/client';
import { useQuery } from '@tanstack/react-query';
import type { AccountType, NormalBalance } from '../../accounts/enums';

export interface IGeneralLedgerQueryParams {
  accountId: number;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export interface LedgerAccountInfo {
  id: number;
  code: string;
  name: string;
  type: AccountType;
  normalBalance: NormalBalance;
}

export interface LedgerEntry {
  date: string; // "2026-01-15"
  transactionCode: string; // "TRN-20260115001"
  description: string;
  debit: number;
  credit: number;
  balance: number; // running balance after this entry
}

export interface IGeneralLedgerResponse {
  account: LedgerAccountInfo;
  dateFrom?: string;
  dateTo?: string;
  openingBalance: number; // stored opening + POSTED activity before dateFrom
  lines: LedgerEntry[]; // current page entries
  closingBalance: number; // running balance at last entry on THIS page
  periodTotalDebits: number; // full period (all pages)
  periodTotalCredits: number; // full period (all pages)
  periodClosingBalance: number; // net at end of full period
}

export const useGetGeneralLedger = (params: IGeneralLedgerQueryParams) => {
  const { page = 1, pageSize = 20, accountId, dateFrom, dateTo } = params;

  return useQuery({
    queryKey: ['accounting-reports-ledger', { page, pageSize, accountId, dateFrom, dateTo }],
    queryFn: async () => {
      const res = await client.get<IGeneralLedgerResponse>('/api/accounting/reports/ledger', {
        params: { page, pageSize, accountId, dateFrom, dateTo },
      });

      const totalCount = Number(res.headers['x-total-count']) || 0;

      return {
        data: res.data,
        totalCount,
      };
    },
    enabled: !!accountId,
  });
};
