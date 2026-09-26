import { useDelete } from '@/hooks/base/delete';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

export const useDeleteTrailer = () => {
  const t = useTranslations('common');

  const { mutate: deleteTrailerMutation, isPending: isDeleteTrailerPending } = useDelete({
    endPoint: 'api/trailers',
    queryKey: ['trailers'],
    onSuccess: () => {
      toast.success(t('message.driver-deleted-successfully'));
    },
  });

  return { deleteTrailerMutation, isDeleteTrailerPending };
};
