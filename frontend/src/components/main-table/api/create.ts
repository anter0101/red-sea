import { useTranslations } from 'next-intl';

import { useCreate } from '@/hooks/base/create';

export interface ICreateGridPayload {
  pageKey: string;
  columns: string[];
}

export const useCreateGrid = () => {
  const t = useTranslations('common');

  const { mutate: createGridMutation, isPending: isCreateGridPending } = useCreate<
    ICreateGridPayload,
    Error,
    ICreateGridPayload
  >({
    endPoint: '/api/grids',
    queryKey: ['grids'],
  });

  return {
    createGridMutation,
    isCreateGridPending,
  };
};
