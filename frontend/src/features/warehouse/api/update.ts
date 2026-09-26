import { useTranslations } from 'next-intl';

import { usePut } from '@/hooks/base/update';
import { ProductPayload, ProductResponse } from '../types/products';

export const useEditProduct = (productId?: string | number) => {
  const t = useTranslations('common');

  const { mutate: editProductMutation, isPending: isEditProductLoading } = usePut<
    ProductPayload,
    Error,
    ProductResponse
  >({
    endPoint: `/api/warehouses/${productId}`,
    queryKey: ['warehouses'],
  });

  return {
    editProductMutation,
    isEditProductLoading,
  };
};
