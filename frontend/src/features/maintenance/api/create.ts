import { useCreate } from '@/hooks/base/create';
import { maintenancesQueryKey, type CreateMaintenancePayload, type IMaintenance } from './get-list';

export function useCreateMaintenance() {
  return useCreate<IMaintenance, Error, CreateMaintenancePayload>({
    endPoint: '/api/maintenances',
    queryKey: [...maintenancesQueryKey],
  });
}
