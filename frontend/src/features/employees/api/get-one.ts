import { useGetOne } from '@/hooks/base/get-one';
import type { IEmployee } from '../types';

export const useGetOneEmployee = (id: number | null, enabled = true) => {
  const { data, isPending, error } = useGetOne<IEmployee, Error>({
    endPoint: `/api/employees/${id}`,
    queryKey: ['employees', ...(id ? [id.toString()] : [])],
    enabled: enabled && id !== null,
  });

  return { employee: data, isGetEmployeePending: isPending, error };
};
