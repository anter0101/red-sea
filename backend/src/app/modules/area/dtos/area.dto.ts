import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseDTO } from 'src/core/utils/base.dto';
import { IsOptional, IsString } from 'class-validator';
import { GovernmentDTO } from '../../government/dtos/government.dto';

export class AreaDTO extends BaseDTO {
  @ApiProperty({ description: 'إسم المنطقة', example: 'مدينة نصر' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'بيانات المحافظة المرتبطة', type: () => GovernmentDTO })
  @IsOptional()
  government?: GovernmentDTO;
}
