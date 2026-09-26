import { useGetPaginated } from '@/hooks/base/get-paginated';
import type { IQueryParams } from '@/types/query-params';

import type { IClient } from '../types';

interface ClientsQueryParams extends IQueryParams {
  // feature-specific params can be added here
}

export const useGetAllClients = (params?: ClientsQueryParams) => {
  const { data, isPending: isGetClientsPending } = useGetPaginated<IClient>({
    endPoint: '/api/clients',
    queryKey: ['clients'],
    params,
  });

  const clients: IClient[] = data?.data ?? [];
  const totalClientsCount = data?.totalCount ?? 0;

  return {
    clients,
    isGetClientsPending,
    totalClientsCount,
  };
};
