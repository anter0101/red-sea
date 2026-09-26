import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { useDelete } from '@/hooks/base/delete';

export const useDeleteCarModel = () => {
  const t = useTranslations('common');

  const { mutate: deleteCarModelMutation, isPending: isDeleteCarModelPending } = useDelete({
    endPoint: 'api/car-models',
    queryKey: ['car-models'],
    onSuccess: () => {
      toast.success(t('actions.car-model-deleted-successfully'));
    },
  });

  return { deleteCarModelMutation, isDeleteCarModelPending };
};
