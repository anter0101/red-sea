import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

/** Shared date-range filter — no pagination (used by Trial Balance, Income Statement). */
export class DateRangeDTO {
  @ApiProperty({
    required: false,
    example: '2024-01-01',
    description: 'Period start date (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiProperty({
    required: false,
    example: '2024-12-31',
    description: 'Period end date (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
