import { UserRoles } from '@/enums/users/user-roles';
import { EMPTY_DISPLAY, orEmptyDisplay } from '@/lib/empty-display';
import { useGetPaginated } from '@/hooks/base/get-paginated';
import { mapSalaryCellValue } from '@/features/salary/driver-salary-form.utils';
import type { IQueryParams } from '@/types/query-params';
import type { IUser } from '@/types/user/index';

export interface IDriverAssistantTableRow {
  id: string | number;
  assistantCode: string;
  assistantName: string;
  status: string;
  currentTrip: string;
  carId?: number | null;
  carCode: string;
  addedBy: string;
  salary: string;
}

interface DriverAssistantsQueryParams extends IQueryParams {
  role?: string;
}

export function mapDriverAssistantRow(user: IUser): IDriverAssistantTableRow {
  return {
    id: user.id ?? '',
    assistantCode: orEmptyDisplay(user.code),
    assistantName:
      [user.firstName, user.lastName].filter(Boolean).join(' ') ||
      orEmptyDisplay(user.username),
    status: orEmptyDisplay(user.status),
    currentTrip:
      user.currentJourneyId != null ? String(user.currentJourneyId) : EMPTY_DISPLAY,
    carId: user.currentCarId != null ? Number(user.currentCarId) : null,
    carCode: orEmptyDisplay(user.currentCarCode),
    addedBy: orEmptyDisplay(user.createdBy),
    salary: mapSalaryCellValue(user.salary, EMPTY_DISPLAY),
  };
}

export const useGetAllDriverAssistants = (params?: DriverAssistantsQueryParams) => {
  const { data, isPending: isGetDriverAssistantsPending } = useGetPaginated<
    IUser,
    DriverAssistantsQueryParams
  >({
    endPoint: `/api/users`,
    queryKey: ['users', 'driver-assistants'],
    params: {
      ...params,
      role: params?.role ?? UserRoles.DRIVER_ASSISTANT,
    },
  });

  const driverAssistants: IDriverAssistantTableRow[] =
    data?.data?.map(mapDriverAssistantRow) ?? [];
  const totalDriverAssistantsCount = data?.totalCount ?? 0;

  return {
    driverAssistants,
    isGetDriverAssistantsPending,
    totalDriverAssistantsCount,
  };
};
