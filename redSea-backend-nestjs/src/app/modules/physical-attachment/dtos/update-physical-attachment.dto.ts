import { PartialType, OmitType } from '@nestjs/swagger';
import { PhysicalAttachmentDTO } from './physical-attachment.dto';

export class UpdatePhysicalAttachmentDTO extends PartialType(
  OmitType(PhysicalAttachmentDTO, [
    'createdAt',
    'updatedAt',
    'deletedAt',
    'createdBy',
    'updatedBy',
    'deletedBy',
    'car',
    'trailer',
  ] as const),
) {}
