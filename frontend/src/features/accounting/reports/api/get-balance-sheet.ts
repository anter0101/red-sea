import client from '@/lib/client';
import { useQuery } from '@tanstack/react-query';
import type { AccountType } from '../../accounts/enums';

export interface IBalanceSheetQueryParams {
  /** Snapshot date (ISO 8601). Defaults to today. */
  asOf?: string;
  /** Default false. Adds balancePriorYear per line + prior-year totals. */
  comparePriorYear?: boolean;
  /** `false` (default) → nested trees. `true` → flat arrays. */
  flat?: boolean;
}

export interface IBalanceSheetLine {
  accountId: number;
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  /** opening + cumulative POSTED through asOf */
  balance: number;
  /** Only when comparePriorYear=true */
  balancePriorYear?: number;
}

export interface IBalanceSheetTreeNode extends IBalanceSheetLine {
  children?: IBalanceSheetTreeNode[];
}

export interface IBalanceSheetResponse {
  flat: boolean;
  asOf: string;
  comparePriorYear: boolean;
  /** Prior date (same calendar date − 1 year) */
  asOfPriorYear?: string;
  /** Present when flat=true */
  assets?: IBalanceSheetLine[];
  /** Present when flat=true */
  liabilities?: IBalanceSheetLine[];
  /** Present when flat=true */
  equity?: IBalanceSheetLine[];
  /** Present when flat=false */
  assetTree?: IBalanceSheetTreeNode[];
  /** Present when flat=false */
  liabilityTree?: IBalanceSheetTreeNode[];
  /** Present when flat=false */
  equityTree?: IBalanceSheetTreeNode[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  /** Present when comparePriorYear=true */
  totalAssetsPriorYear?: number;
  totalLiabilitiesPriorYear?: number;
  totalEquityPriorYear?: number;
  /** totalAssets == totalLiabilities + totalEquity */
  isBalanced: boolean;
  isBalancedPriorYear?: boolean;
}

export const useGetBalanceSheet = (params: IBalanceSheetQueryParams = {}) => {
  return useQuery({
    queryKey: ['accounting-reports-balance-sheet', params],
    queryFn: async () => {
      const res = await client.get<IBalanceSheetResponse>('/api/accounting/reports/balance-sheet', {
        params,
      });
      return res.data;
    },
  });
};
