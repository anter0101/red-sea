import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { useCreate } from '@/hooks/base/create';
import type { ICar } from '@/types';

export const useCreateCar = () => {
  const t = useTranslations('common');
  const { mutate: createCarMutation, isPending: isCreateCarPending } = useCreate<ICar, Error, ICar>(
    {
      endPoint: 'api/cars',
      queryKey: ['cars'],
      onSuccess: () => {
        toast.success(t('actions.car-created-successfully'));
      },
    },
  );
  return { createCarMutation, isCreateCarPending };
};
