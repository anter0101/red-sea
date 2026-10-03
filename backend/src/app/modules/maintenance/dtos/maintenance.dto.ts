import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseDTO } from 'src/core/utils/base.dto';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  Min,
  IsInt,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MaintenanceType } from 'src/core/enums/maintenance-type';
import { CarDTO } from '../../car/dtos/car.dto';
import { TrailerDTO } from '../../trailer/dtos/trailer.dto';
import { TireSelectionDTO } from './tire-selection.dto';

export class MaintenanceDTO extends BaseDTO {
  @ApiProperty({ example: '2026-08-30' })
  @IsDateString()
  maintenanceDate: Date;

  @ApiProperty({ enum: MaintenanceType, example: MaintenanceType.GENERAL })
  @IsEnum(MaintenanceType)
  type: MaintenanceType;

  @ApiPropertyOptional({ type: [TireSelectionDTO] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TireSelectionDTO)
  tireSelections?: TireSelectionDTO[] | null;

  @ApiProperty({ example: 'Oil change and filter replacement' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: 1500.5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  cost?: number;

  @ApiPropertyOptional({ example: 'Done at workshop X' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ type: () => CarDTO })
  @Type(() => CarDTO)
  @IsOptional()
  car?: CarDTO | null;

  @ApiPropertyOptional({ type: () => TrailerDTO })
  @Type(() => TrailerDTO)
  @IsOptional()
  trailer?: TrailerDTO | null;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  carId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  trailerId?: number;
}
