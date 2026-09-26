import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { usePut } from '@/hooks/base/update';

import type { UpdateTransactionBody } from '../types';
import type { ITransactionResponse } from './get-all';

export const useUpdateTransaction = () => {
  const t = useTranslations('accounting.transactions');
  const { mutate: updateTransactionMutation, isPending: isUpdateTransactionPending } = usePut<
    ITransactionResponse,
    Error,
    UpdateTransactionBody
  >({
    endPoint: 'api/accounting/transactions',
    queryKey: ['accounting-transactions'],
    onSuccess: () => {
      toast.success(t('actions.updated'));
    },
  });

  return { updateTransactionMutation, isUpdateTransactionPending };
};
