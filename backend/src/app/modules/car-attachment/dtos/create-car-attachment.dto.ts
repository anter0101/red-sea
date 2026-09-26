import { IsInt } from 'class-validator';
import { OmitType } from '@nestjs/swagger';
import { CarAttachmentDTO } from './car-attachment.dto';

export class CreateCarAttachmentDTO extends OmitType(CarAttachmentDTO, [
  'id',
  'updatedAt',
  'deletedAt',
  'createdBy',
  'updatedBy',
  'deletedBy',
  'car',
] as const) {
  @IsInt()
  carId: number;
}
