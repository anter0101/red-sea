import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { useDelete } from '@/hooks/base/delete';

export const useDeleteClient = () => {
  const t = useTranslations('common');

  const { mutate: deleteClientMutation, isPending: isDeleteClientPending } = useDelete({
    endPoint: '/api/clients',
    queryKey: ['clients'],
    onSuccess: () => {
      toast.success(t('actions.client-deleted-successfully'));
    },
  });

  return { deleteClientMutation, isDeleteClientPending };
};
