import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { useDelete } from '@/hooks/base/delete';

export const useDeletePartner = () => {
  const t = useTranslations('common');

  const { mutate: deletePartnerMutation, isPending: isDeletePartnerPending } = useDelete({
    endPoint: '/api/owners',
    queryKey: ['owners'],
    onSuccess: () => {
      toast.success(t('message.partner-deleted-successfully'));
    },
  });

  return { deletePartnerMutation, isDeletePartnerPending };
};
