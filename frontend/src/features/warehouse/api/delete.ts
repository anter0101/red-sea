import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { useDelete } from '@/hooks/base/delete';

export const useDeleteProduct = () => {
  const t = useTranslations('common');

  const { mutate: deleteProductMutation, isPending: isDeleteProductPending } = useDelete({
    endPoint: 'api/warehouses',
    queryKey: ['api', 'warehouses'],
    onSuccess: () => {
      toast.success(t('message.on-success'));
    },
  });

  return { deleteProductMutation, isDeleteProductPending };
};
