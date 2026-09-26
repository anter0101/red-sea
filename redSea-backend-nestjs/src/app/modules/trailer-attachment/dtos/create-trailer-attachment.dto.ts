// src/trailer-attachment/dtos/create-trailer-attachment.dto.ts
import { IsInt } from 'class-validator';
import { OmitType } from '@nestjs/swagger';
import { TrailerAttachmentDTO } from './trailer-attachment.dto';

export class CreateTrailerAttachmentDTO extends OmitType(TrailerAttachmentDTO, [
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'createdBy',
  'updatedBy',
  'deletedBy',
  'trailer',
] as const) {
  @IsInt()
  trailerId: number;
}
