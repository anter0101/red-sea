import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class BulkDeliveryPriceItemDTO {
  @ApiProperty({ description: 'معرف المنطقة', example: 1 })
  @IsInt()
  @IsPositive()
  areaId: number;

  @ApiPropertyOptional({ description: 'معرف نوع التسعير', example: 1 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  priceTypeId?: number;

  @ApiProperty({ description: 'السعر الأساسي', example: 100 })
  @IsNumber()
  basePrice: number;

  @ApiPropertyOptional({ description: 'رسوم إضافية', example: 10 })
  @IsOptional()
  @IsNumber()
  additionalFees?: number;

  @ApiPropertyOptional({ description: 'ضريبة القيمة المضافة', example: 15 })
  @IsOptional()
  @IsNumber()
  taxPrice?: number;

  @ApiPropertyOptional({ description: 'سعر النولون (دفعة واحدة)', example: 1500 })
  @IsOptional()
  @IsNumber()
  nolonPrice?: number;

  @ApiPropertyOptional({ description: 'مبلغ ناولون الموظف (ثابت)', example: 200 })
  @IsOptional()
  @IsNumber()
  employeeNolonAmount?: number;

  @ApiProperty({ description: 'تاريخ بداية الصلاحية', example: '2024-01-01' })
  @IsDateString()
  validFrom: Date;

  @ApiProperty({ description: 'تاريخ نهاية الصلاحية', example: '2024-12-31' })
  @IsDateString()
  validTo: Date;

  @ApiPropertyOptional({ description: 'ملاحظات إضافية' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class BulkCreateDeliveryPriceDTO {
  @ApiProperty({ description: 'معرف العميل', example: 1 })
  @IsInt()
  @IsPositive()
  clientId: number;

  @ApiProperty({ type: () => [BulkDeliveryPriceItemDTO] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkDeliveryPriceItemDTO)
  @IsNotEmpty()
  items: BulkDeliveryPriceItemDTO[];
}
