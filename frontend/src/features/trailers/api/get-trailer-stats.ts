import client from '@/lib/client';
import { useQuery } from '@tanstack/react-query';

export type TrailerStats = {
  onRoad: number;
  company: number;
  share: number;
  nolon: number;
};

export const useGetTrailerStats = () => {
  return useQuery({
    queryKey: ['trailer-stats'],
    queryFn: async () => {
      const res = await client.get<TrailerStats>('/api/trailers/stats');
      return res.data;
    },
  });
};
