import { useGetPaginated } from '@/hooks/base/get-paginated';
import type { IQueryParams } from '@/types/query-params';

import type { IPhysicalAttachment, VehicleType } from '../types';

const QUERY_KEY = ['physical-attachments'] as const;

export const physicalAttachmentsQueryKey = QUERY_KEY;

type PhysicalAttachmentQueryParams = IQueryParams & {
  carId?: number;
  trailerId?: number;
};

export function useGetPhysicalAttachments(
  vehicleType: VehicleType,
  vehicleId: number,
  enabled = true,
) {
  const params: PhysicalAttachmentQueryParams =
    vehicleType === 'car'
      ? { carId: vehicleId, pageSize: 100 }
      : { trailerId: vehicleId, pageSize: 100 };

  return useGetPaginated<IPhysicalAttachment, PhysicalAttachmentQueryParams>({
    endPoint: '/api/physical-attachments',
    queryKey: [...QUERY_KEY, vehicleType, String(vehicleId)],
    params,
    enabled: enabled && !!vehicleId,
  });
}
