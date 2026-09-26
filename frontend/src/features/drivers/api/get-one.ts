import type { IDriver } from '@/features/drivers/types';
import { useGetOne } from '@/hooks/base/get-one';

export const useGetDriver = (id: number | null, enabled = true) => {
  const { data, isLoading, error } = useGetOne<IDriver, Error>({
    endPoint: `/api/drivers/${id}`,
    queryKey: ['drivers', ...(id ? [id.toString()] : [])],
    enabled,
  });

  return { driver: data, isGetDriverLoading: isLoading, error };
};
