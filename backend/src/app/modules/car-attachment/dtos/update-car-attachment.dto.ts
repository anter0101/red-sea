import { PartialType, OmitType } from '@nestjs/swagger';
import { CarAttachmentDTO } from './car-attachment.dto';

export class UpdateCarAttachmentDTO extends PartialType(
  OmitType(CarAttachmentDTO, [
    'createdAt',
    'updatedAt',
    'deletedAt',
    'createdBy',
    'updatedBy',
    'deletedBy',
    'car',
  ] as const),
) {}
