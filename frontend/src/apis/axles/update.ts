import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import client from '@/lib/client';
import { getApiErrorMessage } from '@/lib/api-error';
import queryClient from '@/lib/query-client';
import type { IAxle, IUpdateAxleRequest } from '@/types/axles';
import { useMutation } from '@tanstack/react-query';

export const useUpdateAxle = () => {
  const locale = useLocale();
  const t = useTranslations('common');

  const mutation = useMutation<IAxle[], Error, IUpdateAxleRequest>({
    mutationFn: async (data) => {
      const res = await client.put('api/axles', data, {
        headers: {
          'Accept-Language': locale,
        },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['axles'] });
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      toast.success(t('actions.axle-updated-successfully'));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t('message.on-error')));
    },
  });

  return {
    updateAxleMutation: mutation.mutate,
    isUpdateAxlePending: mutation.isPending,
  };
};
