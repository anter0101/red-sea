import { usePut } from '@/hooks/base/update';

import { physicalAttachmentsQueryKey } from './get-list';
import type { IPhysicalAttachment, IUpdatePhysicalAttachmentPayload } from '../types';

export function useUpdatePhysicalAttachment() {
  return usePut<IPhysicalAttachment, Error, IUpdatePhysicalAttachmentPayload>({
    endPoint: '/api/physical-attachments',
    queryKey: [...physicalAttachmentsQueryKey],
  });
}
