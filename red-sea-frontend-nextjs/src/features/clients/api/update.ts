import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { usePut } from '@/hooks/base/update';
import { IClient } from '../types';
import type { ClientFormValues } from '../types/create-schema';

export const useEditClient = () => {
  const t = useTranslations('common');
  const { mutate: editClientMutation, isPending: isEditClientLoading } = usePut<
    IClient,
    Error,
    ClientFormValues
  >({
    endPoint: `/api/clients`,
    queryKey: ['clients'],
    onSuccess: () => {
      toast.success(t('actions.client-updated-successfully'));
    },
  });

  return {
    editClientMutation,
    isEditClientLoading,
  };
};
