import { useMutation } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { getApiErrorMessage } from '@/lib/api-error';
import client from '@/lib/client';
import queryClient from '@/lib/query-client';

import type { IOfficeRequestResponse } from '../types';

export interface CustodyPayload {
  amount: number;
  transferTo?: 'TREASURY' | 'EMPLOYEE';
  transferFrom?: 'TREASURY' | 'EMPLOYEE';
  targetEmployeeId?: number;
  sourceEmployeeId?: number;
}

export interface RequestActionArgs {
  id: number;
  status: 'APPROVED' | 'REJECTED';
  custody?: CustodyPayload;
}

export const useRequestAction = () => {
  const t = useTranslations('officeRequests');
  const locale = useLocale();
  const mutation = useMutation<IOfficeRequestResponse, Error, RequestActionArgs>({
    mutationFn: async ({ id, status, custody }) => {
      const body: Record<string, unknown> = { status };
      if (custody !== undefined) body.custody = custody;
      const res = await client.post(`api/office-requests/${id}/request-action`, body, {
        headers: { 'Accept-Language': locale },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['office-requests'] });
      toast.success(t('actions.actioned'));
    },
    onError: (error) => toast.error(getApiErrorMessage(error, t('actions.actionError'))),
  });
  return {
    requestActionMutation: mutation.mutateAsync,
    isRequestActionPending: mutation.isPending,
  };
};
