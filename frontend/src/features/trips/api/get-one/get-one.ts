import { useGetOne } from '@/hooks/base/get-one';
import { ITripResponse } from '../../types/journey';

export const useGetOneTrip = (id: number | null, enabled = true) => {
  const { data, isPending, error } = useGetOne<ITripResponse, Error>({
    endPoint: `/api/journeys/${id}`,
    queryKey: ['journeys', ...(id ? [id.toString()] : [])],
    enabled,
  });

  return { tripResponse: data, isGetTripPending: isPending, error };
};
