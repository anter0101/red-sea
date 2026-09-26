import { useGetOne } from '@/hooks/base/get-one';
import type { ISupplier } from '../types';

export const useGetOneSupplier = (id: number | null, enabled = true) => {
  const { data, isPending, error } = useGetOne<ISupplier, Error>({
    endPoint: `/api/suppliers/${id}`,
    queryKey: ['suppliers', ...(id ? [id.toString()] : [])],
    enabled,
  });
  return { supplier: data, isGetSupplierPending: isPending, error };
};
