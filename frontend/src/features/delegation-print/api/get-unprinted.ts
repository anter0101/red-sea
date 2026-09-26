import { useQuery } from '@tanstack/react-query';

import client from '@/lib/client';

import type { IJourneyDelegationPrintResponse } from '../types';

export const useGetUnprintedJourneys = (enabled = true) => {
  const { data, isPending } = useQuery({
    queryKey: ['delegation-print', 'unprinted'],
    queryFn: async () => {
      const res = await client.get<IJourneyDelegationPrintResponse[]>(
        'api/journey-delegation-prints',
      );
      return res.data;
    },
    enabled,
  });

  return {
    unprintedJourneys: data ?? [],
    isUnprintedJourneysPending: isPending,
  };
};
