import { useGetAllUsers } from '@/apis/users/get-all';
import { usePaginationParams } from '@/hooks/use-pagination-params';

export const useDriverAssistantsPage = () => {
  const params = usePaginationParams();
  const { users, isGetUsersPending, totalUsersCount } = useGetAllUsers(params);

  return {
    assistants: users,
    isLoading: isGetUsersPending,
    totalAssistantsCount: totalUsersCount,
  };
};
