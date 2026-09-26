// src/trailer-attachment/dtos/update-trailer-attachment.dto.ts
import { PartialType, OmitType } from '@nestjs/swagger';
import { TrailerAttachmentDTO } from './trailer-attachment.dto';

export class UpdateTrailerAttachmentDTO extends PartialType(
  OmitType(TrailerAttachmentDTO, [
    'createdAt',
    'updatedAt',
    'deletedAt',
    'createdBy',
    'updatedBy',
    'deletedBy',
    'trailer',
  ] as const),
) {}
