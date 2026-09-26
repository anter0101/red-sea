import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { useCreate } from '@/hooks/base/create';

import type { TransactionLineFormValues } from '../types';
import type { ITransactionLineResponse } from './get-all';

export const useCreateTransactionLine = () => {
  const t = useTranslations('accounting.common');
  const { mutate: createLineMutation, isPending: isCreateLinePending } = useCreate<
    ITransactionLineResponse,
    Error,
    TransactionLineFormValues
  >({
    endPoint: 'api/accounting/transaction-lines',
    queryKey: ['accounting-transaction-lines'],
    onSuccess: () => {
      toast.success(t('save'));
    },
  });

  return { createLineMutation, isCreateLinePending };
};
