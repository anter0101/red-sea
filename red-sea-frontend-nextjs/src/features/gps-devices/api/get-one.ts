import { useGetOne } from '@/hooks/base/get-one';
import { IDeviceResponse } from '../types/device';

export const useGetOneDevice = (id: string, enabled = true) => {
  const { data, isLoading, error } = useGetOne<IDeviceResponse, Error>({
    endPoint: `/api/gps-devices/${id}/`,
    queryKey: ['gps-devices', ...(id ? [id.toString()] : [])],
    enabled,
  });
  return { Device: data, isGetDeviceLoading: isLoading, error };
};
