import { usePut } from '@/hooks/base/update';
import { maintenancesQueryKey, type IMaintenance, type UpdateMaintenancePayload } from './get-list';

export function useUpdateMaintenance() {
  return usePut<IMaintenance, Error, UpdateMaintenancePayload>({
    endPoint: '/api/maintenances',
    queryKey: [...maintenancesQueryKey],
  });
}
