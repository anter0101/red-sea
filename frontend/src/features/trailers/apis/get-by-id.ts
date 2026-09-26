import { useGetOne } from '@/hooks/base/get-one';
import type { ITrailer } from '@/types';

export const useGetTrailerById = (id?: number | null) => {
  const {
    data: trailer,
    isLoading: isTrailerLoading,
    error,
  } = useGetOne<ITrailer, Error>({
    endPoint: `api/trailers/${id}`,
    queryKey: ['trailers', ...(id ? [id.toString()] : [])],
    enabled: !!id,
  });

  return { trailer, isTrailerLoading, error };
};
