import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsDateString } from 'class-validator';
import { PaginateDTO } from 'src/core/utils/paginate.dto';
import { TransactionStatus } from './transaction.dto';

export class QueryTransactionDTO extends PaginateDTO {
  @ApiPropertyOptional({ description: 'Filter by transaction status', enum: TransactionStatus })
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @ApiPropertyOptional({ description: 'Filter by date from', example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'Filter by date to', example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
