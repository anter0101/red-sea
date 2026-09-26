import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import client from '@/lib/client';

export interface IGridConfig {
  pageKey: string;
  columns: string[];
}

export const useGetGridByPageKey = (pageKey: string | null, enabled = true) => {
  const { data, isLoading, error } = useQuery<IGridConfig | null, Error>({
    queryKey: ['grids', ...(pageKey ? [pageKey] : [])],
    enabled: !!pageKey && enabled,
    retry: false,
    queryFn: async () => {
      try {
        const res = await client.get<IGridConfig | null>(`/api/grids/by-page-key/${pageKey}`);
        return res.data ?? null;
      } catch (err) {
        const status = (err as AxiosError)?.response?.status;
        // Missing prefs used to 404; treat as "no saved columns".
        if (status === 404) return null;
        throw err;
      }
    },
  });

  return {
    gridConfig: data ?? null,
    isGetGridLoading: isLoading,
    error,
  };
};
