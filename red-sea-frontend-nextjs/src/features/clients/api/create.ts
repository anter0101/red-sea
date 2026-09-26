import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { useCreate } from '@/hooks/base/create';
import { IClient } from '../types';
import type { ClientFormValues } from '../types/create-schema';

export const useCreateClient = () => {
  const t = useTranslations('common');

  const { mutate: createClientMutate, isPending: isCreateClientPending } = useCreate<
    IClient,
    Error,
    ClientFormValues
  >({
    endPoint: '/api/clients',
    queryKey: ['clients'],
    onSuccess: () => {
      toast.success(t('actions.client-created-successfully'));
    },
  });
  return { createClientMutate, isCreateClientPending };
};
