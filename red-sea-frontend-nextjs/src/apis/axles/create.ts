import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { useCreate } from '@/hooks/base/create';
import type { IAxle } from '@/types/axles';
import { useQueryClient } from '@tanstack/react-query';

export const useCreateAxle = () => {
  const queryClient = useQueryClient();

  const t = useTranslations('common');
  const { mutate: createAxleMutation, isPending: isCreateAxlePending } = useCreate<
    IAxle[],
    Error,
    IAxle[]
  >({
    endPoint: 'api/axles',
    queryKey: ['axles'],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      toast.success(t('actions.axles-created-successfully'));
    },
  });
  return { createAxleMutation, isCreateAxlePending };
};
