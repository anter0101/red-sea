import { useGetOne } from '@/hooks/base/get-one';

import type { ITransactionLineResponse } from './get-all';

export const useGetOneTransactionLine = (id: number | null, enabled = true) => {
  const { data, isLoading, error } = useGetOne<ITransactionLineResponse, Error>({
    endPoint: `/api/accounting/transaction-lines/${id}`,
    queryKey: ['accounting-transaction-lines', ...(id ? [id.toString()] : [])],
    enabled: enabled && id !== null,
  });

  return { transactionLine: data, isGetLineLoading: isLoading, error };
};
