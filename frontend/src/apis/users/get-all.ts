import { UserRoles } from '@/enums/users/user-roles';
import { useGetPaginated } from '@/hooks/base/get-paginated';
import type { IQueryParams } from '@/types/query-params';
import type { IUser } from '@/types/user/index';

interface UsersQueryParams extends IQueryParams {
  role?: string;
}

export const useGetAllUsers = (params?: UsersQueryParams) => {
  const { data, isPending: isGetUsersPending } = useGetPaginated<IUser, UsersQueryParams>({
    endPoint: `/api/users`,
    queryKey: ['users'],
    params: {
      ...params,
      role: params?.role ?? UserRoles.DRIVER_ASSISTANT,
    },
  });

  const users: IUser[] = data?.data ?? [];
  const totalUsersCount = data?.totalCount ?? 0;

  return {
    users,
    isGetUsersPending,
    totalUsersCount,
  };
};
