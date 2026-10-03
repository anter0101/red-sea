import { useGetPaginated } from '@/hooks/base/get-paginated';
import type { IQueryParams } from '@/types/query-params';

export const MAINTENANCE_TYPES = [
  'OIL_CHANGE',
  'TIRE_CHANGE',
  'BRAKES',
  'GENERAL',
  'OTHER',
] as const;

export type MaintenanceType = (typeof MAINTENANCE_TYPES)[number];

export type TirePosition = 'leftOuter' | 'leftInner' | 'rightOuter' | 'rightInner';

export type ITireSnapshot = {
  serialNumber: string;
  type: string;
  healthPercentage: string;
  createdDate?: string;
};

export type ITireSelection = {
  axleNumber: number;
  position: TirePosition;
  tireId?: number;
  location: string;
  previous?: ITireSnapshot;
  next?: ITireSnapshot;
};

export function tireChangeIsComplete(items: ITireSelection[]) {
  return (
    items.length > 0 &&
    items.every((item) => {
      const next = item.next;
      return Boolean(next?.serialNumber.trim() && next.type.trim() && next.healthPercentage.trim());
    })
  );
}

export type IMaintenance = {
  id: number;
  maintenanceDate: string;
  type?: MaintenanceType;
  tireSelections?: ITireSelection[] | null;
  description: string;
  cost?: number | string | null;
  notes?: string | null;
  carId?: number;
  trailerId?: number;
};

export type CreateMaintenancePayload = {
  maintenanceDate: string;
  type: MaintenanceType;
  tireSelections?: ITireSelection[] | null;
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
    queryKey: [...QUERY_KEY, params.carId ? `car-${params.carId}` : `trailer-${params.trailerId}`],
    params: queryParams,
    enabled: enabled && (!!params.carId || !!params.trailerId),
  });
}
