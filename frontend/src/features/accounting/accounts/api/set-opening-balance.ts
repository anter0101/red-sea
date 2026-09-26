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
 * One-time only: sets opening balance on a leaf account.
 * Once set, `openingBalanceLocked = true` and cannot be changed.
 *
 * Errors:
 * - 400 if already locked
 * - 403 if system account
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
