import { useGetOne } from '@/hooks/base/get-one';
import type { IUser } from '@/types/user/index';

export const useGetUser = (id: number | null, enabled = true) => {
  const { data, isLoading, error } = useGetOne<IUser, Error>({
    endPoint: `/api/users/${id}`,
    queryKey: ['users', ...(id ? [id.toString()] : [])],
    enabled,
  });

  return { user: data, isGetUserLoading: isLoading, error };
};
