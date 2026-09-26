import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import type { ICreateOwnerRequest, IOwnerResponse } from '@/features/partners/types';
import { useCreate } from '@/hooks/base/create';

export const useCreatePartner = () => {
  const t = useTranslations('common');

  const { mutate: createPartnerMutation, isPending: isCreatePartnerPending } = useCreate<
    IOwnerResponse,
    Error,
    ICreateOwnerRequest
  >({
    endPoint: '/api/owners',
    queryKey: ['owners'],
    onSuccess: () => {
      toast.success(t('actions.owner-created-successfully'));
    },
  });
  return { createPartnerMutation, isCreatePartnerPending };
};
