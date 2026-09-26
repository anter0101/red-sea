import { useGetPaginated } from '@/hooks/base/get-paginated';
import type { IQueryParams } from '@/types/query-params';

import type { OfficeRequestStatus } from '../enums/office-request-status';
import type { OfficeRequestType } from '../enums/office-request-type';
import type { IOfficeRequestResponse, IOfficeRequestTableRow } from '../types';

export interface IOfficeRequestQueryParams extends IQueryParams {
  journeyId?: number;
  requestedFromId?: number;
  requestedToId?: number;
  status?: OfficeRequestStatus;
  type?: OfficeRequestType;
  updatedAtFrom?: string;
  updatedAtTo?: string;
}

const fullName = (u?: { firstName?: string; lastName?: string }) =>
  u && (u.firstName || u.lastName) ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() : '—';

export function parseRequestedAmount(r: IOfficeRequestResponse): number | null {
  if (r.type !== 'ASK_FOR_CUSTODY') return null;
  const fromDto = r.amount;
  const fromDesc = r.description ? Number(r.description) : NaN;
  const value = fromDto ?? fromDesc;
  return Number.isFinite(value) && value > 0 ? value : null;
}

export function toOfficeRequestRow(r: IOfficeRequestResponse): IOfficeRequestTableRow {
  const requestedAmount = parseRequestedAmount(r);

  return {
    id: r.id,
    type: r.type,
    status: r.status,
    journeyNumber: r.journey?.delegateNumber ?? '—',
    amount: requestedAmount != null ? `${requestedAmount} EGP` : '—',
    requestedAmount,
    fromName: fullName(r.requestedFrom?.user),
    toName: fullName(r.requestedTo?.user),
    createdAt: r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-GB') : '—',
  };
}

export const useGetAllOfficeRequests = (params?: IOfficeRequestQueryParams) => {
  const { data, isPending: isGetOfficeRequestsPending } = useGetPaginated<
    IOfficeRequestResponse,
    IOfficeRequestQueryParams
  >({
    endPoint: '/api/office-requests',
    queryKey: ['office-requests'],
    params,
  });

  const officeRequests: IOfficeRequestTableRow[] = (data?.data ?? []).map(toOfficeRequestRow);
  const totalOfficeRequestsCount = data?.totalCount ?? 0;

  return { officeRequests, isGetOfficeRequestsPending, totalOfficeRequestsCount };
};
