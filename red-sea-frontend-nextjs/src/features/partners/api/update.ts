import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { usePut } from '@/hooks/base/update';
import { IPartner } from '../types';

export const useEditPartner = () => {
  const t = useTranslations('common');
  const { mutate: editPartnerMutation, isPending: isEditPartnerLoading } = usePut<
    IPartner,
    Error,
    IPartner
  >({
    endPoint: `api/owners`,
    queryKey: ['owners'],
    onSuccess: () => {
      toast.success(t('actions.driver-updated-successfully'));
    },
  });

  return {
    editPartnerMutation,
    isEditPartnerLoading,
  };
};
