import client from '@/lib/client';
import { useQuery } from '@tanstack/react-query';

export type JourneyFinancialActivity = {
  id: number;
  date: string;
  code: string;
  description: string;
  accountCode: string;
  accountName: string;
  entryType: 'DEBIT' | 'CREDIT';
  amount: number;
};

export const useGetJourneyFinancialActivity = (journeyId: number) => {
  return useQuery({
    queryKey: ['journey-financial-activity', journeyId],
    queryFn: async () => {
      const res = await client.get<JourneyFinancialActivity[]>(
        `/api/journeys/${journeyId}/financial-activity`,
      );
      return res.data;
    },
    enabled: !!journeyId,
  });
};
