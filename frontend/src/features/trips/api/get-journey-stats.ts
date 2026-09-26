import client from '@/lib/client';
import { useQuery } from '@tanstack/react-query';
import type { IQueryParams } from '@/types/query-params';
import type { JourneyListScope } from '@/features/trips/types/journey-list-scope';
import { journeyScopeToParams } from '@/features/trips/types/journey-list-scope';

export type JourneyStatsByStatus = {
  status: string;
  count: number;
};

export type JourneyStats = {
  total: number;
  journeyCount: number;
  byStatus: JourneyStatsByStatus[];
  totalDistance?: number;
  totalBookWeight?: number;
  totalRevenue?: number;
  totalExpenses?: number;
  totalProfit?: number;
  workingDays?: number;
  currentJourneyId?: number;
  currentCarCode?: string;
};

export type JourneyStatsParams = IQueryParams &
  JourneyListScope & {
    tripStatus?: string;
  };

export const useGetJourneyStats = (params?: JourneyStatsParams) => {
  const { page: _page, pageSize: _pageSize, limit: _limit, ...rest } = params ?? {};
  const scopeParams = journeyScopeToParams(params);
  const filteredParams = Object.fromEntries(
    Object.entries({ ...rest, ...scopeParams }).filter(([, value]) => value !== undefined),
  );

  return useQuery({
    queryKey: ['journey-stats', filteredParams],
    queryFn: async () => {
      const res = await client.get<JourneyStats>('/api/journeys/stats', {
        params: filteredParams,
      });
      return res.data;
    },
    enabled: params !== undefined,
  });
};
