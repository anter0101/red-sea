import { useGetOne } from '@/hooks/base/get-one';
import { IInfo } from '../../types';

export const useGetOneInfo = (id: number | null, enabled = true) => {
  const { data, isLoading, error } = useGetOne<IInfo, Error>({
    endPoint: `/api/journeys/${id}/info`,
    queryKey: ['info', ...(id ? [id.toString()] : [])],
    enabled,
  });

  return { tripInfo: data, isGetInfoLoading: isLoading, error };
};
