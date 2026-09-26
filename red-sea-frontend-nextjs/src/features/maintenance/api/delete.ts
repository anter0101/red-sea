import { useDelete } from '@/hooks/base/delete';
import { maintenancesQueryKey } from './get-list';

export function useDeleteMaintenance() {
  return useDelete({
    endPoint: 'api/maintenances',
    queryKey: [...maintenancesQueryKey],
  });
}
