import { useDelete } from '@/hooks/base/delete';

import { physicalAttachmentsQueryKey } from './get-list';

export function useDeletePhysicalAttachment() {
  return useDelete({
    endPoint: 'api/physical-attachments',
    queryKey: [...physicalAttachmentsQueryKey],
  });
}
