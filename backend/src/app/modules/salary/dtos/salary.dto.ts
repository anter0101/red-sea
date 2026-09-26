import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SalaryType } from 'src/core/enums/salary';
import { BaseDTO } from 'src/core/utils/base.dto';
import { UserDTO } from 'src/app/modules/user/dtos/user.dto';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class SalaryDTO extends BaseDTO {
  @ApiProperty({ enum: SalaryType, required: false })
  @IsOptional()
  @IsEnum(SalaryType)
  salaryType?: SalaryType;

  @ApiPropertyOptional({ example: 5000, description: 'Fixed monthly amount (شهري)' })
  @ValidateIf((o: SalaryDTO) => o.salaryType === SalaryType.MONTHLY)
  @Type(() => Number)
  @IsPositive()
  salaryAmount?: number;

  @ApiPropertyOptional({
    example: 200,
    description: 'Daily work price (شهري / كومسيون / ناولون الشيت)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  dailyWorkPrice?: number;

  @ApiPropertyOptional({
    example: 50,
    description: 'Commission per journey — fixed amount or % (شهري)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  commissionPerJourney?: number;

  @ApiPropertyOptional({
    example: false,
    description: 'Whether commissionPerJourney is a percentage (شهري)',
  })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  commissionIsPercentage?: boolean;

  @ApiPropertyOptional({
    example: 10,
    description: 'Legacy % from nolon — unused; trip amount comes from sheet employeeNolonAmount',
    deprecated: true,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  nolonPercent?: number;

  @ApiProperty({ type: () => UserDTO, required: false })
  user?: UserDTO;
}
