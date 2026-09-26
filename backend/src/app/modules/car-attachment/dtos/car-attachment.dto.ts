import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseDTO } from 'src/core/utils/base.dto';
import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { CarAttachmentType } from 'src/core/enums/car-attachment-types';
import { CarDTO } from '../../car/dtos/car.dto';

export class CarAttachmentDTO extends BaseDTO {
  @ApiProperty({ type: () => CarDTO })
  @Type(() => CarDTO)
  car: CarDTO;

  @ApiProperty({ enum: CarAttachmentType, example: CarAttachmentType.LICENSE })
  @IsEnum(CarAttachmentType)
  type: CarAttachmentType;

  @ApiProperty({ example: '2025-12-31' })
  @IsDateString()
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
