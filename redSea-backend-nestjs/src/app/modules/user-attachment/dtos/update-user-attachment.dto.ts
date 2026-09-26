import { PartialType, OmitType } from '@nestjs/swagger';
import { UserAttachmentDTO } from './user-attachment.dto';

export class UpdateUserAttachmentDTO extends PartialType(
  OmitType(UserAttachmentDTO, [
    'createdAt',
    'updatedAt',
    'deletedAt',
    'createdBy',
    'updatedBy',
    'deletedBy',
    'user',
  ] as const),
) {}
