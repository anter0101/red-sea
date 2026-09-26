import { useGetAll } from '@/hooks/base/get-all';

export const useGetAllGovernments = () => {
  const { data, isPending, isFetchingNextPage, hasNextPage, fetchNextPage } = useGetAll({
    endPoint: `/api/governments`,
    queryKey: ['api', 'governments'],
    pagination: { pageSize: 100, sortOrder: 'ASC' },
  });

  return {
    governments: data?.pages.flatMap((page) => page.data),
    isPending,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  };
};
