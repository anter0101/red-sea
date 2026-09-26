import { useGetOne } from '@/hooks/base/get-one';

import type { IJourneyDelegationPrintResponse } from '../types';

export const useGetDelegationPrintState = (
  journeyId: number | null,
  options?: { enabled?: boolean },
) => {
  const enabled = (options?.enabled ?? true) && journeyId != null;

  const { data, isPending, error, refetch } = useGetOne<IJourneyDelegationPrintResponse, Error>({
    endPoint: `api/journey-delegation-prints/${journeyId}`,
    queryKey: ['delegation-print', String(journeyId ?? '')],
    enabled,
  });

  return {
    printState: data,
    isPrintStatePending: isPending,
    printStateError: error,
    refetchPrintState: refetch,
  };
};
