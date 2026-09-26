import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { useDelete } from '@/hooks/base/delete';

export const useDeleteTransaction = () => {
  const t = useTranslations('accounting.transactions');
  const { mutate: deleteTransactionMutation, isPending: isDeleteTransactionPending } = useDelete<
    unknown,
    Error
  >({
    endPoint: 'api/accounting/transactions',
    queryKey: ['accounting-transactions'],
    onSuccess: () => {
      toast.success(t('actions.deleted'));
    },
  });

  return { deleteTransactionMutation, isDeleteTransactionPending };
};
