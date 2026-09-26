import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import type { ICar } from '@/types';
import { usePut } from '@/hooks/base/update';

import type ICarMutationRequest from '../types/mutation-request';

export const useUpdateCar = () => {
  const t = useTranslations('common');
  const { mutate: updateCarMutation, isPending: isUpdateCarPending } = usePut<
    ICar,
    Error,
    Partial<ICarMutationRequest>
  >({
    endPoint: 'api/cars',
    queryKey: ['cars'],
    onSuccess: () => {
      toast.success(t('actions.car-updated-successfully'));
    },
  });

  return { updateCarMutation, isUpdateCarPending };
};
