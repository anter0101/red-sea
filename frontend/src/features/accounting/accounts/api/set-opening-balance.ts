import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import client from '@/lib/client';
import { getApiErrorMessage } from '@/lib/api-error';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { IAccountResponse } from './get-all';

export interface SetOpeningBalanceBody {
  amount: number;
}

/**
 * PUT /api/accounting/accounts/:id/opening-balance
 *
 * Sets or changes the opening balance of a leaf account (system accounts included), anytime.
 *
 * Errors:
 * - 400 if the account is not a leaf
 */
export const useSetOpeningBalance = () => {
  const t = useTranslations('accounting.accounts');
  const tCommon = useTranslations('common.message');
  const queryClient = useQueryClient();

  const { mutate: setOpeningBalanceMutation, isPending: isSetOpeningBalancePending } = useMutation<
    IAccountResponse,
    Error,
    { id: number; data: SetOpeningBalanceBody }
  >({
    mutationFn: async ({ id, data }) => {
      const res = await client.put<IAccountResponse>(
        `/api/accounting/accounts/${id}/opening-balance`,
        data,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounting-accounts'] });
      toast.success(t('actions.updated'));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, tCommon('on-error')));
    },
  });

  return { setOpeningBalanceMutation, isSetOpeningBalancePending };
};
