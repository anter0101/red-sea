import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { useCreate } from '@/hooks/base/create';

import type { AccountFormValues } from '../types';
import type { IAccountResponse } from './get-all';

export const useCreateAccount = () => {
  const t = useTranslations('accounting.accounts');
  const { mutate: createAccountMutation, isPending: isCreateAccountPending } = useCreate<
    IAccountResponse,
    Error,
    AccountFormValues
  >({
    endPoint: 'api/accounting/accounts',
    queryKey: ['accounting-accounts'],
    onSuccess: () => {
      toast.success(t('actions.created'));
    },
  });

  return { createAccountMutation, isCreateAccountPending };
};
