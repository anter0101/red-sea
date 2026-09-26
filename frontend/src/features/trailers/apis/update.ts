import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import type { ITrailer } from '@/types';
import { usePut } from '@/hooks/base/update';

import type ITrailerMutationRequest from '../types/mutation-request';

export const useUpdateTrailer = () => {
  const t = useTranslations('common');
  const { mutate: updateTrailerMutation, isPending: isUpdateTrailerPending } = usePut<
    ITrailer,
    Error,
    Partial<ITrailerMutationRequest>
  >({
    endPoint: 'api/trailers',
    queryKey: ['trailers'],
    onSuccess: () => {
      toast.success(t('actions.trailer-updated-successfully'));
    },
  });

  return { updateTrailerMutation, isUpdateTrailerPending };
};
