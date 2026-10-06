import client from '@/lib/client';
import { useQuery } from '@tanstack/react-query';

export type AccountingDashboard = {
  revenue: number;
  cost: number;
  netProfit: number;
  clients: number;
  suppliers: number;
};

export function useGetAccountingDashboard(params: { dateFrom: string; dateTo: string }) {
  return useQuery({
    queryKey: ['accounting-reports-dashboard', params],
    queryFn: async () => {
      const res = await client.get<AccountingDashboard>('/api/accounting/reports/dashboard', {
        params,
      });
      return res.data;
    },
  });
}
