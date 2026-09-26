import { useGetOne } from '@/hooks/base/get-one';
import { ITripResponse } from '../../types/journey';
import { IFeesRes, ITripFeesPayload } from '../../types/transactions';

export const useGetOneTransaction = (journeyId: number | null, enabled = true) => {
  const { data, isPending, error } = useGetOne<IFeesRes, Error>({
    endPoint: `/api/journey-transactions/bulk/${journeyId}`,
    queryKey: ['journey-transactions', ...(journeyId ? [journeyId.toString()] : [])],
    enabled,
  });

  return { transactions: data, isGettransactionsPending: isPending, error };
};
