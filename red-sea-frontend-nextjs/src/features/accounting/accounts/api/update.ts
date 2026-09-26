import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { usePut } from '@/hooks/base/update';

import type { AccountUpdateValues } from '../types';
import type { IAccountResponse } from './get-all';

export const useUpdateAccount = () => {
  const t = useTranslations('accounting.accounts');
  const { mutate: updateAccountMutation, isPending: isUpdateAccountPending } = usePut<
    IAccountResponse,
    Error,
    AccountUpdateValues
  >({
    endPoint: 'api/accounting/accounts',
    queryKey: ['accounting-accounts'],
    onSuccess: () => {
      toast.success(t('actions.updated'));
    },
  });

  return { updateAccountMutation, isUpdateAccountPending };
};
