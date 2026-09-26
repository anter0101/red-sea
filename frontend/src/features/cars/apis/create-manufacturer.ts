import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import type { ICarManufacturer } from '@/features/cars/types/manufacturer';
import { useCreate } from '@/hooks/base/create';

interface IManufacturerRequest {
  name: string;
}

export const useCreateManufacturer = () => {
  const t = useTranslations('common');

  const { mutate: createManufacturerMutation, isPending: isCreateManufacturerPending } = useCreate<
    ICarManufacturer,
    Error,
    IManufacturerRequest
  >({
    endPoint: 'api/car-manufacturers',
    queryKey: ['car-manufacturers'],
    onSuccess: () => {
      toast.success(t('actions.manufacturer-created-successfully'));
    },
  });
  return { createManufacturerMutation, isCreateManufacturerPending };
};
