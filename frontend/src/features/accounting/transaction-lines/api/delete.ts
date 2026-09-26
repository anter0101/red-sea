import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { useDelete } from '@/hooks/base/delete';

export const useDeleteTransactionLine = () => {
  const t = useTranslations('accounting.common');
  const { mutate: deleteLineMutation, isPending: isDeleteLinePending } = useDelete<unknown, Error>({
    endPoint: 'api/accounting/transaction-lines',
    queryKey: ['accounting-transaction-lines'],
    onSuccess: () => {
      toast.success(t('delete'));
    },
  });

  return { deleteLineMutation, isDeleteLinePending };
};
