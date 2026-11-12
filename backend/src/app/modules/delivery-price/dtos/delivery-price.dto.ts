import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseDTO } from 'src/core/utils/base.dto';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';
import { ClientDTO } from '../../factory/dtos/client.dto';
import { AreaDTO } from '../../area/dtos/area.dto';
import { PriceTypeDTO } from '../../price-type/dtos/price-type.dto';

export class DeliveryPriceDTO extends BaseDTO {
  @ApiProperty({ type: () => ClientDTO })
  client: ClientDTO;

  @ApiProperty({ type: () => AreaDTO })
  area: AreaDTO;

  @ApiPropertyOptional({ type: () => PriceTypeDTO })
  @IsOptional()
  priceType?: PriceTypeDTO;

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

  @ApiPropertyOptional({ description: 'إجمالي السعر', example: 110 })
  @IsOptional()
  @IsNumber()
  totalPrice?: number;

  @ApiPropertyOptional({ description: 'سعر النولون للطن', example: 150 })
  @IsOptional()
  @IsNumber()
  nolonPrice?: number;

  @ApiPropertyOptional({
    description: 'مبلغ ناولون الموظف (ثابت — لراتب يوم عمل + ناولون الشيت)',
    example: 200,
  })
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
