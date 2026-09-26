import client from '@/lib/client';
import { useQuery } from '@tanstack/react-query';

export type DriverStats = {
  total: number;
  onRoad: number;
  available: number;
};

export const useGetDriverStats = () => {
  return useQuery({
    queryKey: ['driver-stats'],
    queryFn: async () => {
      const res = await client.get<DriverStats>('/api/drivers/stats');
      return res.data;
    },
  });
};
