import client from '@/lib/client';
import { useQuery } from '@tanstack/react-query';

export type CarStats = {
  onRoad: number;
  company: number;
  share: number;
};

export const useGetCarStats = () => {
  return useQuery({
    queryKey: ['car-stats'],
    queryFn: async () => {
      const res = await client.get<CarStats>('/api/cars/stats');
      return res.data;
    },
  });
};
