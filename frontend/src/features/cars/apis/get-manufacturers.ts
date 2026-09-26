import { useGetAll } from '@/hooks/base/get-all';

import type { ICarManufacturer } from '../types/manufacturer';

export const useGetCarManufacturers = () => {
  const {
    data,
    isPending: isGetCarManufacturersPending,
    isFetchingNextPage: isGetCarManufacturersFetchingNextPage,
    hasNextPage: hasGetCarManufacturersNextPage,
    fetchNextPage: fetchNextCarManufacturerPage,
    error: getCarManufacturersError,
  } = useGetAll({
    endPoint: '/api/car-manufacturers',
    queryKey: ['car-manufacturers'],
    pagination: { pageSize: 20, sortOrder: 'ASC' },
  });

  const carManufacturers: ICarManufacturer[] = data?.pages.flatMap((page) => page.data) ?? [];

  return {
    carManufacturers,
    isGetCarManufacturersPending,
    isGetCarManufacturersFetchingNextPage,
    hasGetCarManufacturersNextPage,
    fetchNextCarManufacturerPage,
    getCarManufacturersError,
  };
};
