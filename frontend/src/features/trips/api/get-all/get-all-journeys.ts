import { useGetPaginated } from '@/hooks/base/get-paginated';
import type { IQueryParams } from '@/types/query-params';
import type { JourneyListScope } from '@/features/trips/types/journey-list-scope';
import { journeyScopeToParams } from '@/features/trips/types/journey-list-scope';

export type JourneysQueryParams = IQueryParams &
  JourneyListScope & {
    tripStatus?: string;
    tripStatuses?: string;
    invoiced?: boolean;
  };

export const useGetAllJourneys = (params?: JourneysQueryParams, scope?: JourneyListScope) => {
  const scopeParams = journeyScopeToParams(scope ?? params);
  const mergedParams = { ...params, ...scopeParams };

  const { data, isPending: isGetJourneysPending } = useGetPaginated({
    endPoint: `/api/journeys`,
    queryKey: ['journeys'],
    params: mergedParams,
  });

  const journeys = data?.data ?? [];
  const totalJourneysCount = data?.totalCount ?? 0;

  return {
    journeys,
    isGetJourneysPending,
    totalJourneysCount,
  };
};
