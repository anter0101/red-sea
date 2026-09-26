import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import type { ICarModel } from '@/features/cars/types/model';
import { useCreate } from '@/hooks/base/create';

interface IModelRequest {
  name: string;
  manufacturerId: number;
}

export const useCreateCarModel = () => {
  const t = useTranslations('common');

  const { mutate: createCarModelMutation, isPending: isCreateCarModelPending } = useCreate<
    ICarModel,
    Error,
    IModelRequest
  >({
    endPoint: 'api/car-models',
    queryKey: ['car-models'],
    onSuccess: () => {
      toast.success(t('actions.model-created-successfully'));
    },
  });
  return { createCarModelMutation, isCreateCarModelPending };
};
