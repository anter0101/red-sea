import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseDTO } from 'src/core/utils/base.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PackingType } from 'src/core/enums/packing-type';

export class PriceTypeDTO extends BaseDTO {
  @ApiProperty({ description: 'إسم نوع التسعير', example: 'معبأ' })
  @IsOptional()
  @IsEnum(PackingType)
  name: PackingType;

  @ApiPropertyOptional({ description: 'وصف نوع التسعير', example: 'تسعير للمنتجات المعبأة' })
  @IsOptional()
  @IsString()
  description?: string;
}
