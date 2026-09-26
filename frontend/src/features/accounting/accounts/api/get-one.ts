import { useGetOne } from '@/hooks/base/get-one';

import type { IAccountResponse } from './get-all';

export const useGetOneAccount = (id: number | null, enabled = true) => {
  const { data, isLoading, error } = useGetOne<IAccountResponse, Error>({
    endPoint: `/api/accounting/accounts/${id}`,
    queryKey: ['accounting-accounts', ...(id ? [id.toString()] : [])],
    enabled: enabled && id !== null,
  });

  return { account: data, isGetAccountLoading: isLoading, error };
};
