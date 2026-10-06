import { useTranslations } from 'next-intl';

import { useCreate } from '@/hooks/base/create';
import { ProductPayload, ProductResponse } from '../types/products';

export const useCreateProduct = () => {
  const t = useTranslations('common');

  const { mutate: createProductMutation, isPending: isCreateProductPending } = useCreate<
    ProductResponse,
    Error,
    ProductPayload
  >({
    endPoint: '/api/warehouses',
    queryKey: ['warehouses'],
  });

  return {
    createProductMutation,
    isCreateProductPending,
  };
};
