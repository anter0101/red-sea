import { useGetOne } from '@/hooks/base/get-one';
import { IEmployee } from '../../types';

export const useGetOneEmployee = (id: number | null, enabled = true) => {
  const { data, isLoading, error } = useGetOne<IEmployee, Error>({
    endPoint: `/api/journeys/${id}/employees`,
    queryKey: ['employees', ...(id ? [id.toString()] : [])],
    enabled,
  });

  return { employeeInfo: data, isGetEmployeeLoading: isLoading, error };
};
