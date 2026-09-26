import { useGetOne } from '@/hooks/base/get-one';
import { ProductPayload, ProductResponse } from '../types/products';

export const useGetOneProduct = (id: number | null, enabled = true) => {
  const { data, isLoading, error } = useGetOne<ProductResponse, Error>({
    endPoint: `/api/warehouses/${id}/`,
    queryKey: ['warehouses', ...(id ? [id.toString()] : [])],
    enabled,
  });

  return { ProductInfo: data, isGetProductLoading: isLoading, error };
};
