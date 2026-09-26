import { useGetAll } from '@/hooks/base/get-all';

export const useGetAllAreasByGovernment = (governmentId: string | number | null) => {
  const { data, isPending, isFetchingNextPage, hasNextPage, fetchNextPage } = useGetAll({
    endPoint: `/api/areas`,
    queryKey: ['areas', 'governmentId', String(governmentId ?? '')],
    params: governmentId ? { governmentId } : undefined,
    pagination: { pageSize: 100, sortOrder: 'ASC' },
    enabled: !!governmentId,
  });

  return {
    areas: data?.pages.flatMap((page) => page.data),
    isPending,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  };
};

export const useGetAllAreas = () => {
  const { data, isPending } = useGetAll({
    endPoint: `/api/areas`,
    queryKey: ['areas', 'all'],
    pagination: { pageSize: 500, sortOrder: 'ASC' },
  });

  return {
    areas: data?.pages.flatMap((page) => page.data),
    isPending,
  };
};
