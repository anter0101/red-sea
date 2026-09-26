import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { useCreate } from '@/hooks/base/create';
import type { ITrailer } from '@/types';

export const useCreateTrailer = () => {
  const t = useTranslations('common');
  const { mutate: createTrailerMutation, isPending: isCreateTrailerPending } = useCreate<
    ITrailer,
    Error,
    Partial<ITrailer>
  >({
    endPoint: 'api/trailers',
    queryKey: ['trailers'],
    onSuccess: () => {
      toast.success(t('actions.trailer-created-successfully'));
    },
  });
  return { createTrailerMutation, isCreateTrailerPending };
};
