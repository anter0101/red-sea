import { useGetOne } from '@/hooks/base/get-one';
import type { ICar } from '@/types';

export const useGetOneCar = (id: number | null, enabled = true) => {
  const { data, isLoading, error } = useGetOne<ICar, Error>({
    endPoint: `/api/cars/${id}`,
    queryKey: ['cars', ...(id ? [id.toString()] : [])],
    enabled,
  });

  return { car: data, isGetCarLoading: isLoading, error };
};
