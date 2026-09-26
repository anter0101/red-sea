import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { usePut } from '@/hooks/base/update';
import type { ISupplier } from '../types';

export const useEditSupplier = () => {
  const t = useTranslations('common');
  const { mutate: editSupplierMutation, isPending: isEditSupplierPending } = usePut<
    ISupplier,
    Error,
    ISupplier
  >({
    endPoint: `/api/suppliers`,
    queryKey: ['suppliers'],
    onSuccess: () => {
      toast.success(t('actions.supplier-updated-successfully'));
    },
  });

  return {
    editSupplierMutation,
    isEditSupplierPending,
  };
};
