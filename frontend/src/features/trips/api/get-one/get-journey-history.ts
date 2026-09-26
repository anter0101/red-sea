import client from '@/lib/client';
import { useQuery } from '@tanstack/react-query';

export type JourneyStatusEvent = {
  id: number;
  fromStatus?: string | null;
  toStatus: string;
  changedBy?: string;
  createdAt?: string;
};

export const useGetJourneyHistory = (journeyId: number) => {
  return useQuery({
    queryKey: ['journey-history', journeyId],
    queryFn: async () => {
      const res = await client.get<JourneyStatusEvent[]>(`/api/journeys/${journeyId}/history`);
      return res.data;
    },
    enabled: !!journeyId,
  });
};
