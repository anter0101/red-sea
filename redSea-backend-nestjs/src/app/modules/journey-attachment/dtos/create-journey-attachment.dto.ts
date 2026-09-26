import { ApiProperty, OmitType } from '@nestjs/swagger';
import { JourneyAttachmentDTO } from './journey-attachment.dto';
import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateJourneyAttachmentDTO extends OmitType(JourneyAttachmentDTO, [
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'createdBy',
  'updatedBy',
  'deletedBy',
  'journey',
] as const) {
  @IsInt()
  @ApiProperty({ description: 'Journey id' })
  @IsNotEmpty()
  journeyId: number;
}
