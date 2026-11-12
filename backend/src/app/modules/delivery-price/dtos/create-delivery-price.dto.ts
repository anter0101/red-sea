import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive } from 'class-validator';
import { DeliveryPriceDTO } from './delivery-price.dto';

export class CreateDeliveryPriceDTO extends OmitType(DeliveryPriceDTO, [
  'id',
  'updatedAt',
  'client',
  'area',
  'priceType',
  'totalPrice',
] as const) {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  clientId: number;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  areaId: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  priceTypeId?: number;
}
