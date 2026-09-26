import { format } from 'date-fns';

import { EMPTY_DISPLAY, orEmptyDisplay } from '@/lib/empty-display';
import { formatPlateLettersForDisplay } from '@/lib/plate-letters';
import { useGetPaginated } from '@/hooks/base/get-paginated';
import type { IQueryParams } from '@/types/query-params';

export interface ITrailerTableRow {
  id: number | string;
  code: string;
  manufacturer: string;
  model: string;
  status: string;
  manufactureYear: number | string;
  color: string;
  maxWeight: string;
  plateNumber: string;
  plateLetters: string;
  chassisNumber: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  ownerShip: string;
  notes: string;
  createdBy: string;
}

interface TrailersQueryParams extends IQueryParams {
  ownerShip?: string;
}

export function mapTrailerRow(trailer: any): ITrailerTableRow {
  return {
    id: trailer.id,
    code: orEmptyDisplay(trailer.code),
    manufacturer: orEmptyDisplay(trailer.manufacturer),
    model: orEmptyDisplay(trailer.model),
    status: orEmptyDisplay(trailer.status),
    manufactureYear: orEmptyDisplay(trailer.manufactureYear),
    color: orEmptyDisplay(trailer.color),
    maxWeight: trailer.maxWeight != null ? String(trailer.maxWeight) : EMPTY_DISPLAY,
    plateNumber: orEmptyDisplay(trailer.plateNumber),
    plateLetters: formatPlateLettersForDisplay(trailer.plateLetters),
    chassisNumber: orEmptyDisplay(trailer.chassisNumber),
    licenseNumber: orEmptyDisplay(trailer.licenseNumber),
    licenseExpiryDate: trailer.licenseExpiryDate
      ? format(new Date(trailer.licenseExpiryDate), 'dd/MM/yyyy')
      : EMPTY_DISPLAY,
    ownerShip: orEmptyDisplay(trailer.ownerShip),
    notes: orEmptyDisplay(trailer.notes),
    createdBy: orEmptyDisplay(trailer.createdBy),
  };
}

export const useGetAllTrailers = (params?: TrailersQueryParams) => {
  const { data, isPending: isGetTrailersPending } = useGetPaginated({
    endPoint: '/api/trailers',
    queryKey: ['trailers'],
    params,
  });

  const trailers = data?.data?.map(mapTrailerRow) ?? [];
  const totalTrailersCount = data?.totalCount ?? 0;

  return {
    trailers,
    isGetTrailersPending,
    totalTrailersCount,
  };
};
