import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import type { ITireModel } from '@/features/cars/types/tire-model';
import { useCreate } from '@/hooks/base/create';

interface ITireModelRequest {
  name: string;
}

export const useCreateTireModel = () => {
  const t = useTranslations('common');

  const { mutate: createTireModelMutation, isPending: isCreateTireModelPending } = useCreate<
    ITireModel,
    Error,
    ITireModelRequest
  >({
    endPoint: 'api/tire-models',
    queryKey: ['tire-models'],
    onSuccess: () => {
      toast.success(t('actions.tire-model-created-successfully'));
    },
  });
  return { createTireModelMutation, isCreateTireModelPending };
};
