import { useGetAll } from '@/hooks/base/get-all';

import type { ITripActivity } from '../../components/transactions-table';

export const useGetAllTransactionsByJourney = (journeyId: string | null) => {
  const { data, isPending, isFetchingNextPage, hasNextPage, fetchNextPage } = useGetAll({
    endPoint: `/api/journey-transactions`,
    queryKey: ['journey-transactions', journeyId || 'none'],
    params: journeyId ? { journeyId } : undefined,
    pagination: { pageSize: 50, sortOrder: 'DESC' },
    enabled: !!journeyId,
  });

  const transactions: ITripActivity[] | undefined = data?.pages.flatMap((page) =>
    page.data.map((item: ITripActivity) => ({
      dateTime: new Date(item.createdAt ?? '').toLocaleString(),
      category: item.category,
      amount: item.amount,
      transactionType: item.transactionType,
    })),
  );

  return {
    transactions,
    isPending,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  };
};
