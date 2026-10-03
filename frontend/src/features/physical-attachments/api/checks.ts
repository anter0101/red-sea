import { useLocale, useTranslations } from 'next-intl';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import client from '@/lib/client';
import { getApiErrorMessage } from '@/lib/api-error';
import queryClient from '@/lib/query-client';

import { physicalAttachmentsQueryKey } from './get-list';
import type { IPhysicalAttachmentCheck } from '../types';

export function useGetAttachmentChecks(id?: number | null, enabled = true) {
  return useQuery({
    queryKey: ['physical-attachment-checks', id ? String(id) : 'none'],
    enabled: enabled && !!id,
    queryFn: async () => {
      const res = await client.get<IPhysicalAttachmentCheck[]>(
        `/api/physical-attachments/${id}/checks`,
      );
      return res.data;
    },
  });
}

export function useRecordAttachmentCheck() {
  const locale = useLocale();
  const t = useTranslations('common.message');

  return useMutation({
    mutationFn: async ({ id, checked }: { id: number; checked: boolean }) => {
      const res = await client.post<IPhysicalAttachmentCheck>(
        `/api/physical-attachments/${id}/checks`,
        { checked },
        { headers: { 'Accept-Language': locale } },
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['physical-attachment-checks'] });
      queryClient.invalidateQueries({ queryKey: [...physicalAttachmentsQueryKey] });
      toast.success(t('on-success'));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t('on-error')));
    },
  });
}
