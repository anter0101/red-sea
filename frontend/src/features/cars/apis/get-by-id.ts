import type { ICar } from '@/types';
import { useGetOne } from '@/hooks/base/get-one';

export const useGetCarById = (id?: number | null) => {
  const {
    data: car,
    isLoading: isCarLoading,
    error,
  } = useGetOne<ICar, Error>({
    endPoint: `api/cars/${id}`,
    queryKey: ['cars', ...(id ? [id.toString()] : [])],
    enabled: !!id,
  });

  return { car, isCarLoading, error };
};
