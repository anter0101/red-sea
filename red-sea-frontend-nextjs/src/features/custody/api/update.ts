import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { usePut } from '@/hooks/base/update';

import type { CustodyBody, ICustodyResponse } from '../types';

export const useUpdateCustody = () => {
  const t = useTranslations('custody');
  const { mutate: updateCustodyMutation, isPending: isUpdateCustodyPending } = usePut<
    ICustodyResponse,
    Error,
    Partial<CustodyBody>
  >({
    endPoint: 'api/custodies',
    queryKey: ['custodies'],
    onSuccess: () => toast.success(t('actions.updated')),
  });
  return { updateCustodyMutation, isUpdateCustodyPending };
};
