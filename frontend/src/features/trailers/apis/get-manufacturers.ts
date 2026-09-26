import { useGetAll } from '@/hooks/base/get-all';

import type { ITrailerManufacturer } from '../types/manufacturer';

export const useGetTrailerManufacturers = () => {
  const {
    data,
    isPending: isGetTrailerManufacturersPending,
    isFetchingNextPage: isGetTrailerManufacturersFetchingNextPage,
    hasNextPage: hasGetTrailerManufacturersNextPage,
    fetchNextPage: fetchNextTrailerManufacturerPage,
    error: getTrailerManufacturersError,
  } = useGetAll({
    endPoint: '/api/trailer-manufacturers',
    queryKey: ['trailer-manufacturers'],
    pagination: { pageSize: 20, sortOrder: 'ASC' },
  });

  const trailerManufacturers: ITrailerManufacturer[] =
    data?.pages.flatMap((page) => page.data) ?? [];

  return {
    trailerManufacturers,
    isGetTrailerManufacturersPending,
    isGetTrailerManufacturersFetchingNextPage,
    hasGetTrailerManufacturersNextPage,
    fetchNextTrailerManufacturerPage,
    getTrailerManufacturersError,
  };
};
