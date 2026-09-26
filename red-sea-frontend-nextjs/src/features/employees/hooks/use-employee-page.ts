import { useRouter } from 'next/navigation';

import { useDeleteEmployee } from '../api/delete';
import { useGetOneEmployee } from '../api/get-one';

export const useEmployeePage = (branchId: number, employeeId: number) => {
  const router = useRouter();
  const { employee, isGetEmployeePending, error } = useGetOneEmployee(employeeId);
  const { deleteEmployeeMutation, isDeleteEmployeePending } = useDeleteEmployee();

  const handleDelete = () => {
    deleteEmployeeMutation(employeeId.toString(), {
      onSuccess: () => {
        router.push(`/branches/${branchId}`);
      },
    });
  };

  const handleEdit = () => {
    router.push(`/branches/${branchId}/employees/${employeeId}/update`);
  };

  return {
    employee,
    isGetEmployeePending,
    error,
    handleDelete,
    handleEdit,
    isDeleteEmployeePending,
  };
};
