import client from '@/lib/client';
import { useQuery } from '@tanstack/react-query';

export interface OfficeCustodyAmount {
  employeeId: number;
  accountId: number;
  accountName: string;
  custodyAmount: number;
}

/**
 * Custody balance for the journey create form. Office users get their own balance; admins pass
 * `employeeId` to read the balance of the employee they picked.
 */
export const useGetOfficeCustodyAmount = (options?: { enabled?: boolean; employeeId?: number }) => {
  const employeeId = options?.employeeId;
  const enabled = options?.enabled ?? true;
  const { data, isPending } = useQuery<OfficeCustodyAmount>({
    queryKey: ['office-custody-amount', employeeId ?? 'me'],
    queryFn: async () => {
      const res = await client.get('/api/journeys/office/custody-amount', {
        params: employeeId ? { employeeId } : undefined,
      });
      return res.data;
    },
    enabled,
  });

  // A disabled query stays "pending" forever; only report loading while it can actually run.
  return { custodyAmount: data, isCustodyAmountPending: enabled && isPending };
};
