import { useGetAll } from '@/hooks/base/get-all';

import type { ICarModel } from '../types/model';

export const useGetCarModels = (manufacturerId?: string) => {
  const {
    data,
    isPending: isGetCarModelsPending,
    isFetchingNextPage: isGetCarModelsFetchingNextPage,
    hasNextPage: hasGetCarModelsNextPage,
    fetchNextPage: fetchNextCarModelPage,
    error: getCarModelsError,
  } = useGetAll({
    endPoint: '/api/car-models',
    queryKey: ['car-models', ...(manufacturerId ? [manufacturerId] : [])],
    pagination: { pageSize: 20, sortOrder: 'ASC' },
    enabled: !!manufacturerId,
    params: manufacturerId ? { manufacturerId } : {},
  });

  const carModels: ICarModel[] = data?.pages.flatMap((page) => page.data) ?? [];

  return {
    carModels,
    isGetCarModelsPending,
    isGetCarModelsFetchingNextPage,
    hasGetCarModelsNextPage,
    fetchNextCarModelPage,
    getCarModelsError,
  };
};
