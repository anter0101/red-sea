import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsInt, IsOptional, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';
import { PhysicalAttachmentDTO } from './physical-attachment.dto';

export class CreatePhysicalAttachmentDTO extends OmitType(PhysicalAttachmentDTO, [
  'id',
  'updatedAt',
  'deletedAt',
  'createdBy',
  'updatedBy',
  'deletedBy',
  'car',
  'trailer',
] as const) {
  @ApiPropertyOptional({ description: 'Car ID (provide exactly one of carId or trailerId)' })
  @ValidateIf((o: CreatePhysicalAttachmentDTO) => o.trailerId == null)
  @IsInt()
  @Type(() => Number)
  carId?: number;

  @ApiPropertyOptional({ description: 'Trailer ID (provide exactly one of carId or trailerId)' })
  @ValidateIf((o: CreatePhysicalAttachmentDTO) => o.carId == null)
  @IsInt()
  @Type(() => Number)
  trailerId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  createdAt?: Date;
}
