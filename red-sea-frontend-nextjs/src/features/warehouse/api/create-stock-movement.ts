import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { useCreate } from '@/hooks/base/create';
import type { StockMovementPayload, StockMovementResponse } from '../types/products';

export const useCreateStockMovement = (productId: number) => {
  const t = useTranslations('common');

  const { mutateAsync: createStockMovement, isPending: isCreateStockMovementPending } = useCreate<
    StockMovementResponse,
    Error,
    StockMovementPayload
  >({
    endPoint: `/api/warehouses/${productId}/stock-movements`,
    queryKey: ['warehouses', String(productId)],
    onSuccess: () => {
      toast.success(t('message.on-success'));
    },
  });

  return { createStockMovement, isCreateStockMovementPending };
};
