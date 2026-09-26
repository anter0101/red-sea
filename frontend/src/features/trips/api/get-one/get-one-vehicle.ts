import { useGetOne } from '@/hooks/base/get-one';
import { IVehicle } from '../../types';

export const useGetOneVehicle = (id: number | null, enabled = true) => {
  const { data, isLoading, error } = useGetOne<IVehicle, Error>({
    endPoint: `/api/journeys/${id}/vehicles`,
    queryKey: ['vehicles', ...(id ? [id.toString()] : [])],
    enabled,
  });

  return { vehicleInfo: data, isGetCarLoading: isLoading, error };
};
