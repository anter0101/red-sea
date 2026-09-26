import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import client from '@/lib/client';
import { getApiErrorMessage } from '@/lib/api-error';
import queryClient from '@/lib/query-client';

import type { IJourneyDelegationPrintResponse } from '../types';

export const useMarkDelegationPrinted = () => {
  const t = useTranslations('custody.print');

  const mutation = useMutation<IJourneyDelegationPrintResponse, Error, number>({
    mutationFn: async (journeyId) => {
      const res = await client.post<IJourneyDelegationPrintResponse>(
        `api/journey-delegation-prints/${journeyId}/mark-printed`,
      );
      return res.data;
    },
    onSuccess: (_data, journeyId) => {
      queryClient.invalidateQueries({ queryKey: ['delegation-print', String(journeyId)] });
      toast.success(t('marked'));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t('error')));
    },
  });

  return {
    markPrintedMutation: mutation.mutateAsync,
    isMarkPrintedPending: mutation.isPending,
  };
};
