import client from '@/lib/client';
import { useQuery } from '@tanstack/react-query';
import { UserRoles } from '@/enums/users/user-roles';

export type DriverAssistantStats = {
  total: number;
  onRoad: number;
  available: number;
};

export const useGetDriverAssistantStats = () => {
  return useQuery({
    queryKey: ['user-stats', UserRoles.DRIVER_ASSISTANT],
    queryFn: async () => {
      const res = await client.get<DriverAssistantStats>('/api/users/stats', {
        params: { role: UserRoles.DRIVER_ASSISTANT },
      });
      return res.data;
    },
  });
};
