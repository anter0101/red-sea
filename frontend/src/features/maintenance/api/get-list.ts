import { useGetPaginated } from '@/hooks/base/get-paginated';
import type { IQueryParams } from '@/types/query-params';

export type IMaintenance = {
  id: number;
  maintenanceDate: string;
  description: string;
  cost?: number | string | null;
  notes?: string | null;
  carId?: number;
  trailerId?: number;
};

export type CreateMaintenancePayload = {
  maintenanceDate: string;
  description: string;
  cost?: number;
  notes?: string;
  carId?: number;
  trailerId?: number;
};

export type UpdateMaintenancePayload = Partial<CreateMaintenancePayload>;

const QUERY_KEY = ['maintenances'] as const;
export const maintenancesQueryKey = QUERY_KEY;

type MaintenanceQueryParams = IQueryParams & {
  carId?: number;
  trailerId?: number;
};

export function useGetMaintenances(params: { carId?: number; trailerId?: number }, enabled = true) {
  const queryParams: MaintenanceQueryParams = {
    ...params,
    pageSize: 100,
  };

  return useGetPaginated<IMaintenance, MaintenanceQueryParams>({
    endPoint: '/api/maintenances',
    queryKey: [
      ...QUERY_KEY,
      params.carId ? `car-${params.carId}` : `trailer-${params.trailerId}`,
    ],
    params: queryParams,
    enabled: enabled && (!!params.carId || !!params.trailerId),
  });
}
