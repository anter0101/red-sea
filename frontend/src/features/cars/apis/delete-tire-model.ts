import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { useDelete } from '@/hooks/base/delete';

export const useDeleteTireModel = () => {
  const t = useTranslations('common');

  const { mutate: deleteTireModelMutation, isPending: isDeleteTireModelPending } = useDelete({
    endPoint: 'api/tire-models',
    queryKey: ['tire-models'],
    onSuccess: () => {
      toast.success(t('actions.tire-model-deleted-successfully'));
    },
  });

  return { deleteTireModelMutation, isDeleteTireModelPending };
};
