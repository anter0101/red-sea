import client from '@/lib/client';
import { useQuery } from '@tanstack/react-query';

import type { StockMovementResponse } from '../types/products';

export const useGetStockMovements = (productId: number | null, page = 1, pageSize = 20) => {
  const { data, isPending, error, refetch } = useQuery({
    queryKey: ['warehouses', productId, 'stock-movements', page, pageSize],
    enabled: !!productId,
    queryFn: async () => {
      const res = await client.get<StockMovementResponse[]>(
        `/api/warehouses/${productId}/stock-movements`,
        { params: { page, pageSize } },
      );
      return {
        data: res.data ?? [],
        totalCount: Number(res.headers['x-total-count']) || 0,
      };
    },
  });

  return {
    movements: data?.data ?? [],
    totalCount: data?.totalCount ?? 0,
    isPending,
    error,
    refetch,
  };
};
