import { useRouter } from 'next/navigation';

import { usePaginationParams } from '@/hooks/use-pagination-params';

import { useGetAllEmployees } from '../api/get-all';

export const useEmployeesPage = (branchId: number) => {
  const router = useRouter();
  const { page, limit } = usePaginationParams();
  const {
    employees,
    isGetEmployeesPending: isLoading,
    totalEmployeesCount,
  } = useGetAllEmployees({
    branchId,
    page,
    pageSize: limit,
  });

  const handleAddEmployee = () => {
    router.push(`/branches/${branchId}/employees/create`);
  };

  const handleEditEmployee = (id: number) => {
    router.push(`/branches/${branchId}/employees/${id}/update`);
  };

  return {
    employees,
    isLoading,
    totalEmployeesCount,
    handleAddEmployee,
    handleEditEmployee,
  };
};
