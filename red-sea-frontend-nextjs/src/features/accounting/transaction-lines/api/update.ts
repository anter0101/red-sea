import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { usePut } from '@/hooks/base/update';

import type { TransactionLineFormValues } from '../types';
import type { ITransactionLineResponse } from './get-all';

export const useUpdateTransactionLine = () => {
  const t = useTranslations('accounting.common');
  const { mutate: updateLineMutation, isPending: isUpdateLinePending } = usePut<
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

  return { updateLineMutation, isUpdateLinePending };
};
