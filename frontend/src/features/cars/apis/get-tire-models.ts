import { useGetAll } from '@/hooks/base/get-all';
import type { ITireModel } from '@/types/axles/tire-model';

export const useGetTireModels = () => {
  const {
    data,
    isPending: isGetTireModelsPending,
    isFetchingNextPage: isGetTireModelsFetchingNextPage,
    hasNextPage: hasGetTireModelsNextPage,
    fetchNextPage: fetchNextTireModelPage,
    error: getTireModelsError,
  } = useGetAll({
    endPoint: '/api/tire-models',
    queryKey: ['tire-models'],
    pagination: { pageSize: 20, sortOrder: 'ASC' },
  });

  const tireModels: ITireModel[] = data?.pages.flatMap((page) => page.data) ?? [];

  return {
    tireModels,
    isGetTireModelsPending,
    isGetTireModelsFetchingNextPage,
    hasGetTireModelsNextPage,
    fetchNextTireModelPage,
    getTireModelsError,
  };
};
