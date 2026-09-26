import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { useCreate } from '@/hooks/base/create';

import type { CustodyBody, ICustodyResponse } from '../types';

export const useCreateCustody = () => {
  const t = useTranslations('custody');
  const { mutate: createCustodyMutation, isPending: isCreateCustodyPending } = useCreate<
    ICustodyResponse,
    Error,
    CustodyBody
  >({
    endPoint: 'api/custodies',
    queryKey: ['custodies'],
    onSuccess: () => toast.success(t('actions.created')),
  });
  return { createCustodyMutation, isCreateCustodyPending };
};
