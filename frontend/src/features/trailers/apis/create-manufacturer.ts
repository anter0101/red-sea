import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import type { ITrailerManufacturer } from '@/features/trailers/types/manufacturer';
import { useCreate } from '@/hooks/base/create';

interface IManufacturerRequest {
  name: string;
}

export const useCreateTrailerManufacturer = () => {
  const t = useTranslations('common');

  const {
    mutate: createTrailerManufacturerMutation,
    isPending: isCreateTrailerManufacturerPending,
  } = useCreate<ITrailerManufacturer, Error, IManufacturerRequest>({
    endPoint: 'api/trailer-manufacturers',
    queryKey: ['trailer-manufacturers'],
    onSuccess: () => {
      toast.success(t('actions.manufacturer-created-successfully'));
    },
  });
  return {
    createTrailerManufacturerMutation,
    isCreateTrailerManufacturerPending,
  };
};
