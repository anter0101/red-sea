import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsDateString, IsOptional } from 'class-validator';
import { ReportFlatQueryDTO } from './report-flat-flag.dto';

/** Query params for the Balance Sheet — `asOf` only (no pagination). */
export class BalanceSheetQueryDTO extends ReportFlatQueryDTO {
  @ApiProperty({
    required: false,
    example: '2024-12-31',
    description: 'Point-in-time snapshot date (ISO 8601, defaults to today)',
  })
  @IsOptional()
  @IsDateString()
  asOf?: string;

  @ApiPropertyOptional({
    default: false,
    description:
      'When true, each line includes balancePriorYear and section totals include prior-year columns (same calendar date one year earlier).',
  })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === '1' || value === 1)
  @IsBoolean()
  comparePriorYear?: boolean;
}
