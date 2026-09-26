import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { StockMovementType } from '../stock-movement.enums';
import { ProductCondition } from '../warehouse.enums';

export class CreateStockMovementDTO {
  @ApiProperty({ enum: StockMovementType })
  @IsEnum(StockMovementType)
  type: StockMovementType;

  @ApiProperty({
    description: 'Absolute delta for IN/OUT, or target quantity for ADJUST',
    example: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  quantity: number;

  @ApiPropertyOptional({ example: 'طن' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ example: 1250.5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  unitPrice?: number;

  @ApiPropertyOptional({ description: 'وزن كملاحظة على الحركة فقط', example: '2.5 طن' })
  @IsOptional()
  @IsString()
  weightNote?: string;

  @ApiPropertyOptional({ enum: ProductCondition })
  @IsOptional()
  @IsEnum(ProductCondition)
  condition?: ProductCondition;

  @ApiPropertyOptional({ example: 2024 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(2100)
  manufacturingYear?: number;

  @ApiPropertyOptional({ example: '2025-01-15' })
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiPropertyOptional({ example: 'توريد من المورد' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
