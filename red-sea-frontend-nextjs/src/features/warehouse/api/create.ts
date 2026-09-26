import { useTranslations } from 'next-intl';

import { useCreate } from '@/hooks/base/create';
import { ProductPayload, ProductResponse } from '../types/products';

export const useCreateProduct = () => {
  const t = useTranslations('common');

  const { mutate: createProductMutation, isPending: isCreateProductPending } = useCreate<
    ProductPayload,
    Error,
    ProductResponse
  >({
    endPoint: '/api/warehouses',
    queryKey: ['warehouses'],
  });

  return {
    createProductMutation,
    isCreateProductPending,
  };
};
