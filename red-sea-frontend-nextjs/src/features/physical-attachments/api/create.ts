import { useCreate } from '@/hooks/base/create';

import { physicalAttachmentsQueryKey } from './get-list';
import type { ICreatePhysicalAttachmentPayload, IPhysicalAttachment } from '../types';

export function useCreatePhysicalAttachment() {
  return useCreate<IPhysicalAttachment, Error, ICreatePhysicalAttachmentPayload>({
    endPoint: '/api/physical-attachments/',
    queryKey: [...physicalAttachmentsQueryKey],
  });
}
