import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { useCreate } from '@/hooks/base/create';

import type { TransactionFormValues } from '../types';
import type { ITransactionResponse } from './get-all';

export const useCreateTransaction = () => {
  const t = useTranslations('accounting.transactions');
  const { mutate: createTransactionMutation, isPending: isCreateTransactionPending } = useCreate<
    ITransactionResponse,
    Error,
    TransactionFormValues
  >({
    endPoint: 'api/accounting/transactions',
    queryKey: ['accounting-transactions'],
    onSuccess: () => {
      toast.success(t('actions.created'));
    },
  });

  return { createTransactionMutation, isCreateTransactionPending };
};
