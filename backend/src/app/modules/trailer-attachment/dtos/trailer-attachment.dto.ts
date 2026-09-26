// src/trailer-attachment/dtos/trailer-attachment.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseDTO } from 'src/core/utils/base.dto';
import { IsString, IsOptional, IsDate, IsEnum } from 'class-validator';
import { TrailerDTO } from '../../trailer/dtos/trailer.dto';
import { TrailerAttachmentType } from 'src/core/enums/trailer-attachment-types';

export class TrailerAttachmentDTO extends BaseDTO {
  @ApiProperty({ type: () => TrailerDTO })
  trailer: TrailerDTO;

  @ApiProperty({ enum: TrailerAttachmentType, example: TrailerAttachmentType.LICENSE })
  @IsEnum(TrailerAttachmentType)
  type: TrailerAttachmentType;

  @ApiProperty({ example: '2025-12-31' })
  @IsDate()
  @IsOptional()
  documentExpiryDate: Date;

  @ApiProperty({ example: 'https://example.com/file.pdf' })
  @IsString()
  url: string;

  @ApiPropertyOptional({ example: 'Additional notes about this attachment' })
  @IsOptional()
  @IsString()
  notes?: string;
}
