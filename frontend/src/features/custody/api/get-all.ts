import { useGetPaginated } from '@/hooks/base/get-paginated';
import type { IQueryParams } from '@/types/query-params';

import type { CustodyStatus } from '../enums/custody-status';
import type {
  ICustodyDriver,
  ICustodyJourney,
  ICustodyResponse,
  ICustodyTableRow,
  ICustodyUser,
  ICustodyVehicle,
} from '../types';

export interface ICustodyQueryParams extends IQueryParams {
  status?: CustodyStatus;
  employeeId?: number;
  accountId?: number;
  journeyId?: number;
  driverId?: number;
  updatedAtFrom?: string;
  updatedAtTo?: string;
}

const fullName = (u?: ICustodyUser) =>
  u && (u.firstName || u.lastName) ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() : '—';

const formatPlate = (vehicle?: ICustodyVehicle) => {
  if (!vehicle?.plateNumber) return '—';
  return vehicle.plateLetters
    ? `${vehicle.plateNumber} ${vehicle.plateLetters}`.trim()
    : vehicle.plateNumber;
};

const resolveDriver = (
  custodyDriver?: ICustodyDriver | null,
  journey?: ICustodyJourney | null,
): ICustodyDriver | undefined => custodyDriver ?? journey?.driver;

export function toCustodyRow(c: ICustodyResponse): ICustodyTableRow {
  const driver = resolveDriver(c.driver, c.journey);

  return {
    id: c.id,
    employeeName: fullName(c.employee?.user),
    accountName: c.account?.name ?? '—',
    custodyAmount: c.custodyAmount != null ? `${c.custodyAmount} EGP` : '—',
    journeyId: c.journeyId ?? c.journey?.id ?? null,
    journeyNumber: c.journey?.delegateNumber ?? '—',
    driverName: fullName(driver?.user),
    driverLicense: driver?.licenseNumber ?? '—',
    driverAssistantName: fullName(c.journey?.driverAssistant),
    carPlate: formatPlate(c.journey?.car),
    trailerPlate: formatPlate(c.journey?.trailer),
    status: c.status,
    createdAt: c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-GB') : '—',
  };
}

export const useGetAllCustodies = (params?: ICustodyQueryParams) => {
  const { data, isPending: isGetCustodiesPending } = useGetPaginated<
    ICustodyResponse,
    ICustodyQueryParams
  >({
    endPoint: '/api/custodies',
    queryKey: ['custodies'],
    params,
  });

  const custodies: ICustodyTableRow[] = (data?.data ?? []).map(toCustodyRow);
  const totalCustodiesCount = data?.totalCount ?? 0;

  return { custodies, isGetCustodiesPending, totalCustodiesCount };
};
