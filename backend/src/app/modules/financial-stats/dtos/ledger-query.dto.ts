import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginateDTO } from 'src/core/utils/paginate.dto';

/** Query params for the General Ledger — the only report that needs pagination. */
export class LedgerQueryDTO extends PaginateDTO {
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

  @ApiProperty({ description: 'Account ID to retrieve the ledger for', example: 1 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  accountId: number;
}
