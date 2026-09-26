'use client';

import { useSearchParams } from 'next/navigation';

type PaginationParams = {
  page: number;
  limit: number;
  offset: number;
};

type UsePaginationParamsOptions = {
  defaultLimit?: number;
};

/**
 * Hook to get pagination params from URL query parameters.
 * Use this in your API hooks to get the current page and limit.
 *
 * @example
 * const { page, limit, offset } = usePaginationParams();
 * // Use in your API call
 * const { data } = useQuery({
 *   queryKey: ['items', page, limit],
 *   queryFn: () => fetchItems({ page, limit })
 * });
 */
export function usePaginationParams(options: UsePaginationParamsOptions = {}) {
  const { defaultLimit = 10 } = options;
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || defaultLimit;
  const offset = (page - 1) * limit;

  const search = searchParams.get('search') || undefined;
  const createdAtFrom = searchParams.get('createdAtFrom') || undefined;
  const createdAtTo = searchParams.get('createdAtTo') || undefined;
  const tripStatus = searchParams.get('tripStatus') || undefined;

  return {
    page,
    limit,
    pageSize: limit,
    offset,
    search,
    createdAtFrom,
    createdAtTo,
    tripStatus,
  };
}
