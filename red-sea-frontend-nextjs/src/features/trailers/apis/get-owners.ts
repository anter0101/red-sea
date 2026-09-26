import { useLocale } from 'next-intl';

import client from '@/lib/client';
import { useQuery } from '@tanstack/react-query';

export interface IOwner {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  transactionType?: string;
  paymentNumber?: string;
  notes?: string;
}

interface GetOwnersParams {
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export const useGetTrailerOwners = (params: GetOwnersParams = {}) => {
  const locale = useLocale();
  const { page = 1, pageSize = 10, sortField = 'id', sortOrder = 'ASC' } = params;

  const { data, isPending, refetch } = useQuery({
    queryKey: ['owners', { page, pageSize, sortField, sortOrder }],
    queryFn: async () => {
      const res = await client.get('/api/owners', {
        params: {
          page,
          pageSize,
          sortField,
          sortOrder,
        },
        headers: {
          'Accept-Language': locale,
        },
      });

      return res.data as IOwner[];
    },
  });

  return { owners: data, isPending, refetch };
};
