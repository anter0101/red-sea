import client from '@/lib/client';
import { useQuery } from '@tanstack/react-query';
import type { AccountType } from '../../accounts/enums';

export interface IIncomeStatementQueryParams {
  dateFrom?: string;
  dateTo?: string;
  /** `false` (default) → nested trees. `true` → flat revenues[]/expenses[] arrays. */
  flat?: boolean;
}

export interface IIncomeStatementLine {
  accountId: number;
  accountCode: string;
  accountName: string;
  /** REVENUE or EXPENSE */
  accountType: AccountType;
  /** credits−debits for REVENUE, debits−credits for EXPENSE */
  amount: number;
}

export interface IIncomeStatementTreeNode extends IIncomeStatementLine {
  children?: IIncomeStatementTreeNode[];
}

export interface IIncomeStatementResponse {
  flat: boolean;
  dateFrom?: string;
  dateTo?: string;
  /** Present when flat=true */
  revenues?: IIncomeStatementLine[];
  /** Present when flat=true */
  expenses?: IIncomeStatementLine[];
  /** Present when flat=false */
  revenueTree?: IIncomeStatementTreeNode[];
  /** Present when flat=false */
  expenseTree?: IIncomeStatementTreeNode[];
  totalRevenue: number;
  totalExpenses: number;
  /** totalRevenue − totalExpenses */
  netIncome: number;
}

export const useGetIncomeStatement = (params: IIncomeStatementQueryParams = {}) => {
  return useQuery({
    queryKey: ['accounting-reports-income-statement', params],
    queryFn: async () => {
      const res = await client.get<IIncomeStatementResponse>(
        '/api/accounting/reports/income-statement',
        { params },
      );
      return res.data;
    },
  });
};
