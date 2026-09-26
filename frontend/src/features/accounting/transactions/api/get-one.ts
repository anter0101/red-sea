import { useGetOne } from '@/hooks/base/get-one';

import type { ITransactionResponse } from './get-all';

export const useGetOneTransaction = (id: number | null, enabled = true) => {
  const { data, isLoading, error } = useGetOne<ITransactionResponse, Error>({
    endPoint: `/api/accounting/transactions/${id}`,
    queryKey: ['accounting-transactions', ...(id ? [id.toString()] : [])],
    enabled: enabled && id !== null,
  });

  return { transaction: data, isGetTransactionLoading: isLoading, error };
};
