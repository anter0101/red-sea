import { useGetOne } from '@/hooks/base/get-one';
import type { ITrailer } from '@/types';

export const useGetOneTrailer = (id: number | null, enabled = true) => {
  const { data, isLoading, error } = useGetOne<ITrailer, Error>({
    endPoint: `/api/trailers/${id}`,
    queryKey: ['trailers', ...(id ? [id.toString()] : [])],
    enabled,
  });

  return { trailer: data, isGetTrailerLoading: isLoading, error };
};
