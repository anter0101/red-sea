import { useGetAll } from '@/hooks/base/get-all';

export const useGetAllDeviceTails = (gpsDeviceId: number | string) => {
  const { data, isPending, isFetchingNextPage, hasNextPage, fetchNextPage, error } = useGetAll({
    endPoint: `/api/gps-tails`,
    queryKey: ['api', 'v1', 'gps-tails'],
    params: { gpsDeviceId },
    pagination: { pageSize: 20, sortOrder: 'DESC' },
    enabled: !!gpsDeviceId,
  });

  return {
    deviceTails: data?.pages.flatMap((page) => page.data),
    isPending,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  };
};
