import client from '@/lib/client';

import type { FetchAllPaginatedOptions, FetchAllPaginatedResult } from './types';

const DEFAULT_PAGE_SIZE = 200;
const DEFAULT_MAX_ROWS = 50_000;

function stripPaginationParams<T extends Record<string, unknown>>(params: T) {
  const { page: _page, pageSize: _pageSize, limit: _limit, offset: _offset, ...rest } = params;
  return Object.fromEntries(Object.entries(rest).filter(([, value]) => value !== undefined));
}

function defaultParseResponse<T>(
  data: unknown,
  headers: Record<string, string | number | undefined>,
): { items: T[]; totalCount: number } {
  const items = Array.isArray(data) ? (data as T[]) : [];
  const totalCount = Number(headers['x-total-count']) || items.length;
  return { items, totalCount };
}

export async function fetchAllPaginated<
  T,
  TParams extends Record<string, unknown> = Record<string, unknown>,
>({
  endPoint,
  params = {} as TParams,
  pageSize = DEFAULT_PAGE_SIZE,
  maxRows = DEFAULT_MAX_ROWS,
  parseResponse = defaultParseResponse,
}: FetchAllPaginatedOptions<TParams, T>): Promise<FetchAllPaginatedResult<T>> {
  const filterParams = stripPaginationParams(params);
  const allData: T[] = [];
  let totalCount = 0;
  let page = 1;

  while (true) {
    const res = await client.get(endPoint, {
      params: {
        ...filterParams,
        page,
        pageSize,
      },
    });

    const parsed = parseResponse(res.data, res.headers as Record<string, string | number | undefined>);
    const batch = parsed.items;
    totalCount = parsed.totalCount;

    if (allData.length + batch.length > maxRows) {
      throw new Error(`EXPORT_MAX_ROWS_EXCEEDED:${maxRows}`);
    }

    allData.push(...batch);

    if (allData.length >= totalCount || batch.length < pageSize) {
      break;
    }

    page += 1;
  }

  return { data: allData, totalCount };
}
