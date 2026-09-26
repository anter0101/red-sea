import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseDTO } from 'src/core/utils/base.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SupplierType } from '../enums/supplier-type.enum';
import { GovernmentDTO } from '../../government/dtos/government.dto';

export class SupplierDTO extends BaseDTO {
  @ApiProperty({
    description: 'كود المورد',
    example: 'S-123456',
  })
  @IsString()
  code: string;

  @ApiProperty({
    description: 'اسم المورد',
    example: 'شركة الموردين المتحدة',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'نوع المورد (بضائع - خدمات - نقل)',
    example: SupplierType.GOODS,
    enum: SupplierType,
  })
  @IsEnum(SupplierType)
  type: SupplierType;

  @ApiPropertyOptional({ description: 'بيانات المحافظة المرتبطة', type: () => GovernmentDTO })
  @IsOptional()
  government?: GovernmentDTO;

  @ApiProperty({
    description: 'تليفون',
    example: '01001234567',
  })
  @IsString()
  phone: string;

  @ApiProperty({
    description: 'سجل تجاري',
    example: 'CR-1234567890',
  })
  @IsString()
  commercialRegister: string;

  @ApiProperty({
    description: 'بطاقة ضريبية',
    example: 'TAX-123456',
  })
  @IsString()
  taxCard: string;

  @ApiProperty({
    description: 'رقم التسجيل الضريبي',
    example: 'TRN-987654321',
  })
  @IsString()
  taxRegistrationNumber: string;
}
