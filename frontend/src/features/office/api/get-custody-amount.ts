import { useQuery } from '@tanstack/react-query';

import client from '@/lib/client';

export interface OfficeCustodyAmount {
  employeeId: number;
  accountId: number;
  accountName: string;
  custodyAmount: number;
}

export const useGetOfficeCustodyAmount = (options?: { enabled?: boolean }) => {
  const { data, isPending: isCustodyAmountPending } = useQuery<OfficeCustodyAmount>({
    queryKey: ['office-custody-amount'],
    queryFn: async () => {
      const res = await client.get('/api/journeys/office/custody-amount');
      return res.data;
    },
    enabled: options?.enabled ?? true,
  });

  return { custodyAmount: data, isCustodyAmountPending };
};
