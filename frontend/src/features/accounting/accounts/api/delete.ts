import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { useDelete } from '@/hooks/base/delete';

export const useDeleteAccount = () => {
  const t = useTranslations('accounting.accounts');
  const { mutate: deleteAccountMutation, isPending: isDeleteAccountPending } = useDelete<
    unknown,
    Error
  >({
    endPoint: 'api/accounting/accounts',
    queryKey: ['accounting-accounts'],
    onSuccess: () => {
      toast.success(t('actions.deleted'));
    },
  });

  return { deleteAccountMutation, isDeleteAccountPending };
};
