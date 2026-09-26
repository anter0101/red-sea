import { useGetAll } from '@/hooks/base/get-all';

import type { IGovernorate } from '../types/delivery-price';

export const useGetDeliveryPrices = (clientId: string) => {
  const { data, isPending: isGetDeliveryPricesPending } = useGetAll({
    endPoint: '/api/delivery-prices',
    queryKey: ['delivery-prices', clientId],
    pagination: { pageSize: 100, sortField: 'validFrom', sortOrder: 'DESC' },
    params: { clientId: Number(clientId) },
  });

  const governorates = data?.pages.flatMap((page) => page.data) ?? ([] as IGovernorate[]);

  return {
    governorates,
    isGetDeliveryPricesPending,
    totalCount: data?.pages[0]?.totalCount,
  };
};
