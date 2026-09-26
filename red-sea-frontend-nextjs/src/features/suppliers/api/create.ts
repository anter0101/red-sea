import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { useCreate } from '@/hooks/base/create';
import type { ISupplier } from '../types';

export const useCreateSupplier = () => {
  const t = useTranslations('common');

  const { mutate: createSupplierMutate, isPending: isCreateSupplierPending } = useCreate<
    ISupplier,
    Error,
    ISupplier
  >({
    endPoint: '/api/suppliers',
    queryKey: ['suppliers'],
    onSuccess: () => {
      toast.success(t('actions.supplier-created-successfully'));
    },
  });
  return { createSupplierMutate, isCreateSupplierPending };
};
