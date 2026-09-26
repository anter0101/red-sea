import { EMPTY_DISPLAY, orEmptyDisplay } from '@/lib/empty-display';
import { useGetPaginated } from '@/hooks/base/get-paginated';
import { mapSalaryCellValue } from '@/features/salary/driver-salary-form.utils';
import type { IQueryParams } from '@/types/query-params';

export interface IDriverTableRow {
  id: string | number;
  driverCode: string;
  driverName: string;
  license: string;
  status: string;
  currentTrip: string;
  carId?: number | null;
  carCode: string;
  addedBy: string;
  salary: string;
}

interface DriversQueryParams extends IQueryParams {}

export function mapDriverRow(driver: any): IDriverTableRow {
  return {
    id: driver.id,
    driverCode: orEmptyDisplay(driver.user?.code),
    driverName:
      `${driver.user?.firstName ?? ''} ${driver.user?.lastName ?? ''}`.trim() ||
      orEmptyDisplay(driver.user?.username),
    license: orEmptyDisplay(driver.licenseNumber),
    status: orEmptyDisplay(driver.user?.status),
    currentTrip: driver.currentJourneyId != null ? String(driver.currentJourneyId) : EMPTY_DISPLAY,
    carId: driver.currentCarId != null ? Number(driver.currentCarId) : null,
    carCode: orEmptyDisplay(driver.currentCarCode),
    addedBy: orEmptyDisplay(driver.user?.createdBy),
    salary: mapSalaryCellValue(driver.user?.salary, EMPTY_DISPLAY),
  };
}

export const useGetAllDrivers = (params?: DriversQueryParams) => {
  const { data, isPending: isGetDriversPending } = useGetPaginated({
    endPoint: `/api/drivers`,
    queryKey: ['drivers'],
    params,
  });

  const drivers = data?.data?.map(mapDriverRow) ?? [];
  const totalDriversCount = data?.totalCount ?? 0;

  return {
    drivers,
    isGetDriversPending,
    totalDriversCount,
  };
};
