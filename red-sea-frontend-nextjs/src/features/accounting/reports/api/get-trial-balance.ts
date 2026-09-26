import client from '@/lib/client';
import { useQuery } from '@tanstack/react-query';
import type { AccountType, NormalBalance } from '../../accounts/enums';

export interface ITrialBalanceQueryParams {
  dateFrom?: string;
  dateTo?: string;
  /** `false` (default) → nested tree with rolled-up parent totals. `true` → flat array. */
  flat?: boolean;
}

export interface ITrialBalanceLine {
  accountId: number;
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  normalBalance: NormalBalance;
  totalDebit: number; // POSTED debits in period
  totalCredit: number; // POSTED credits in period
  balance: number; // net period movement (signed)
  openingBalance: number; // stored opening + POSTED before dateFrom
  openingDebit: number; // opening split to debit column
  openingCredit: number; // opening split to credit column
  closingBalance: number; // opening + signed period movement
  closingDebit: number; // closing split to debit column
  closingCredit: number; // closing split to credit column
}

export interface ITrialBalanceTreeNode extends ITrialBalanceLine {
  children?: ITrialBalanceTreeNode[];
}

export interface ITrialBalanceResponse {
  flat: boolean;
  dateFrom?: string;
  dateTo?: string;
  /** Present when flat=true */
  lines?: ITrialBalanceLine[];
  /** Present when flat=false */
  tree?: ITrialBalanceTreeNode[];
  grandTotalDebit: number;
  grandTotalCredit: number;
  grandOpeningDebit: number;
  grandOpeningCredit: number;
  /** |grandTotalDebit − grandTotalCredit| < 0.01 */
  isBalanced: boolean;
}

export const useGetTrialBalance = (params: ITrialBalanceQueryParams = {}) => {
  return useQuery({
    queryKey: ['accounting-reports-trial-balance', params],
    queryFn: async () => {
      const res = await client.get<ITrialBalanceResponse>('/api/accounting/reports/trial-balance', {
        params,
      });
      return res.data;
    },
  });
};
