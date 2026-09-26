import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { useDelete } from '@/hooks/base/delete';

export const useDeleteSupplier = () => {
  const t = useTranslations('common');

  const { mutate: deleteSupplierMutation, isPending: isDeleteSupplierPending } = useDelete({
    endPoint: '/api/suppliers',
    queryKey: ['suppliers'],
    onSuccess: () => {
      toast.success(t('actions.supplier-deleted-successfully'));
    },
  });

  return { deleteSupplierMutation, isDeleteSupplierPending };
};
