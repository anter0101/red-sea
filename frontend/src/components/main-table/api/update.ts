import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { usePut } from '@/hooks/base/update';

export interface IUpdateGridPayload {
  pageKey: string;
  columns: string[];
}

export const useUpdateGrid = () => {
  const t = useTranslations('common');

  const { mutate: updateGridMutation, isPending: isUpdateGridPending } = usePut<
    IUpdateGridPayload,
    Error,
    IUpdateGridPayload
  >({
    endPoint: '/api/grids',
    queryKey: ['grids'],
    onSuccess: () => {
      toast.success(t('actions.grid-updated-successfully'));
    },
  });

  return {
    updateGridMutation,
    isUpdateGridPending,
  };
};
