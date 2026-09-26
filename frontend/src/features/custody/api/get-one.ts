import { useGetOne } from '@/hooks/base/get-one';

import type { ICustodyResponse } from '../types';

export const useGetOneCustody = (id: number | null) => {
  const { data: custody, isPending: isGetCustodyLoading } = useGetOne<ICustodyResponse, Error>({
    endPoint: `/api/custodies/${id}`,
    queryKey: ['custodies', String(id ?? '')],
    enabled: id != null,
  });
  return { custody, isGetCustodyLoading };
};
