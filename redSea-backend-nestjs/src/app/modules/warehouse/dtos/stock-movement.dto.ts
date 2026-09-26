import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseDTO } from 'src/core/utils/base.dto';
import { StockMovementType } from '../stock-movement.enums';
import { ProductCondition } from '../warehouse.enums';

export class StockMovementDTO extends BaseDTO {
  @ApiProperty({ enum: StockMovementType })
  type: StockMovementType;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  quantityBefore: number;

  @ApiProperty()
  quantityAfter: number;

  @ApiPropertyOptional()
  unit?: string;

  @ApiPropertyOptional()
  unitPrice?: number;

  @ApiPropertyOptional()
  weightNote?: string;

  @ApiPropertyOptional({ enum: ProductCondition })
  condition?: ProductCondition;

  @ApiPropertyOptional()
  manufacturingYear?: number;

  @ApiPropertyOptional()
  purchaseDate?: Date | string;

  @ApiPropertyOptional()
  expiryDate?: Date | string;

  @ApiPropertyOptional()
  reason?: string;

  @ApiPropertyOptional()
  notes?: string;

  @ApiPropertyOptional()
  warehouseId?: number;
}
