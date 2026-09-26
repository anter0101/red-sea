import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseDTO } from 'src/core/utils/base.dto';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { PricingSheetKind } from 'src/core/enums/pricing-sheet-kind';

export class ClientDTO extends BaseDTO {
  @ApiProperty({
    description: 'اسم العميل / الشركة',
    example: 'شركة الشرق للصناعات الهندسية',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'السجل التجاري',
    example: 'CR-1234567890',
  })
  @IsString()
  commercialRecord: string;

  @ApiPropertyOptional({
    description: 'رقم الفاتورة الضريبية',
    example: 'TAX-INV-2024-55123',
  })
  @IsString()
  @IsOptional()
  taxInvoice?: string;

  @ApiProperty({
    description: 'كود العميل (يُنشأ تلقائياً عند الإنشاء)',
    example: 'CL-202609021',
  })
  @IsString()
  companyCode: string;

  @ApiPropertyOptional({
    description: 'ملف الوجهات للعميل (PDF/JSON/etc.)',
    example: 'destinations-file.pdf',
  })
  @IsString()
  @IsOptional()
  destinationsFile?: string;

  @ApiProperty({
    description: 'أسلوب شيت الأسعار',
    enum: PricingSheetKind,
    example: PricingSheetKind.ARISH,
  })
  @IsEnum(PricingSheetKind)
  pricingSheetKind: PricingSheetKind;
}
