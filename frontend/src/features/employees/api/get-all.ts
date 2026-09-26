import { useGetPaginated } from '@/hooks/base/get-paginated';
import type { IQueryParams } from '@/types/query-params';

import type { IEmployee, IEmployeeTableRow } from '../types';

interface EmployeesQueryParams extends IQueryParams {
  branchId?: number;
  factoryId?: number;
}

export function mapEmployeeRow(employee: IEmployee): IEmployeeTableRow {
  return {
    id: employee.id ?? 0,
    name: `${employee.user?.firstName ?? ''} ${employee.user?.lastName ?? ''}`.trim() || '—',
    role: employee.user?.role ?? 'DATA_ENTRY',
    custody: employee.custody != null ? `${employee.custody} EGP` : '—',
    lastSeen: employee.updatedAt ? new Date(employee.updatedAt).toLocaleDateString('en-GB') : '—',
    status: employee.user?.status ?? 'UNAVAILABLE',
    salary: employee.user?.salary?.salaryAmount
      ? `${employee.user.salary.salaryAmount} EGP`
      : '—',
    salaryType: employee.user?.salary?.salaryType ?? 'MONTHLY',
    joinDate: employee.createdAt ? new Date(employee.createdAt).toLocaleDateString('en-GB') : '—',
  };
}

export const useGetAllEmployees = (params?: EmployeesQueryParams) => {
  const { data, isPending: isGetEmployeesPending } = useGetPaginated<
    IEmployee,
    EmployeesQueryParams
  >({
    endPoint: `/api/employees`,
    queryKey: ['employees'],
    params,
  });

  const employees: IEmployeeTableRow[] = data?.data?.map(mapEmployeeRow) ?? [];

  const totalEmployeesCount = data?.totalCount ?? 0;

  return {
    employees,
    isGetEmployeesPending,
    totalEmployeesCount,
  };
};
