import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseDTO } from 'src/core/utils/base.dto';
import { IsDateString, IsInt, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { IsEnum } from 'class-validator';
import { ProductCondition, ProductStatus } from '../warehouse.enums';
import { SupplierDTO } from '../../supplier/dtos/supplier.dto';

export class WarehouseDTO extends BaseDTO {
  @ApiProperty({
    description: 'اسم المنتج',
    example: 'اسمنت مقاوم للكبريتات',
  })
  @IsString()
  name: string;

  code: string;

  @ApiProperty({
    description: 'الحالة',
    example: 'AVAILABLE',
  })
  @IsEnum(ProductStatus)
  status: ProductStatus;

  @ApiPropertyOptional({
    description: 'حالة المنتج',
    example: ProductCondition.NEW,
    enum: ProductCondition,
  })
  @IsOptional()
  @IsEnum(ProductCondition)
  condition?: ProductCondition;

  @ApiProperty({
    description: 'الفئة',
    example: 'مواد بناء',
  })
  @IsString()
  category: string;

  @ApiProperty({
    description: 'العدد',
    example: 250,
  })
  @IsInt()
  @Min(0)
  quantity: number;

  @ApiProperty({
    description: 'عدد التنبيه',
    example: 25,
  })
  @IsInt()
  @Min(0)
  alertQuantity: number;

  @ApiProperty({
    description: 'الوحدة',
    example: 'طن',
  })
  @IsString()
  unit: string;

  @ApiProperty({
    description: 'المورد',
  })
  supplier: SupplierDTO;

  @ApiProperty({
    description: 'سعر الوحدة',
    example: 1250.5,
  })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({
    description: 'سنة الصنع',
    example: 2024,
  })
  @IsInt()
  @Min(1900)
  @Max(2100)
  @IsOptional()
  manufacturingYear?: number;

  @ApiPropertyOptional({
    description: 'تاريخ الشراء',
    example: '2025-01-15',
  })
  @IsDateString()
  @IsOptional()
  purchaseDate?: Date;

  @ApiPropertyOptional({
    description: 'تاريخ الصلاحية',
    example: '2026-12-31',
  })
  @IsDateString()
  @IsOptional()
  expiryDate?: Date;

  @ApiPropertyOptional({
    description: 'آخر تاريخ صرف (من حركات المخزون)',
  })
  @IsOptional()
  lastUsedDate?: Date | string | null;
}
