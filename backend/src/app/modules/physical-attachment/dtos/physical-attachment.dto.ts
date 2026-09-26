import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseDTO } from 'src/core/utils/base.dto';
import { IsString, IsOptional, IsDateString, IsNumber, Min, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { CarDTO } from '../../car/dtos/car.dto';
import { TrailerDTO } from '../../trailer/dtos/trailer.dto';

export class PhysicalAttachmentDTO extends BaseDTO {
  @ApiProperty({ example: 'Spare tire' })
  @IsString()
  name: string;

  @ApiProperty({ example: '2025-12-31' })
  @IsDateString()
  date: Date;

  @ApiPropertyOptional({ example: 'Located in the cargo bay' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/uploads/photo.jpg' })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiPropertyOptional({ example: 1500.5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  confirmedOk?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  confirmedBy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  confirmedAt?: Date;

  @ApiPropertyOptional({ type: () => CarDTO })
  @Type(() => CarDTO)
  @IsOptional()
  car?: CarDTO | null;

  @ApiPropertyOptional({ type: () => TrailerDTO })
  @Type(() => TrailerDTO)
  @IsOptional()
  trailer?: TrailerDTO | null;
}
