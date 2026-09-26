import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { useDelete } from '@/hooks/base/delete';

export const useDeleteUser = () => {
  const t = useTranslations('common');

  const { mutate: deleteUserMutation, isPending: isDeleteUserPending } = useDelete({
    endPoint: 'api/users',
    queryKey: ['users'],
    onSuccess: () => {
      toast.success(t('message.driver-deleted-successfully'));
    },
  });
  return { deleteUserMutation, isDeleteUserPending };
};
