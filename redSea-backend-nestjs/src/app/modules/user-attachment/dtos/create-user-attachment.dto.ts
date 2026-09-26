import { IsInt } from 'class-validator';
import { OmitType } from '@nestjs/swagger';
import { UserAttachmentDTO } from './user-attachment.dto';

export class CreateUserAttachmentDTO extends OmitType(UserAttachmentDTO, [
  'id',
  'updatedAt',
  'deletedAt',
  'createdBy',
  'updatedBy',
  'deletedBy',
  'user',
] as const) {
  @IsInt()
  userId: number;
}
