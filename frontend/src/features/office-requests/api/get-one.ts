import { useGetOne } from '@/hooks/base/get-one';

import type { IOfficeRequestResponse } from '../types';

export const useGetOneOfficeRequest = (id: number | null) => {
  const { data: officeRequest, isPending: isGetOfficeRequestLoading } = useGetOne<
    IOfficeRequestResponse,
    Error
  >({
    endPoint: `/api/office-requests/${id}`,
    queryKey: ['office-requests', String(id ?? '')],
    enabled: id != null,
  });
  return { officeRequest, isGetOfficeRequestLoading };
};
