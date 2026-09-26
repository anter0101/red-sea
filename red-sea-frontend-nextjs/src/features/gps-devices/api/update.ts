import { usePut } from '@/hooks/base/update';
import { IAssignCarRequest, ICar } from '../types/device';

export const useAssignCarDevice = (deviceId: string | number) => {
  const { mutate: assignCarMutation, isPending: isAssignCarLoading } = usePut<
    ICar,
    Error,
    IAssignCarRequest
  >({ endPoint: `/api/gps-devices/${deviceId}`, queryKey: ['gps-devices', `${deviceId}`] });

  return {
    assignCarMutation,
    isAssignCarLoading,
  };
};
