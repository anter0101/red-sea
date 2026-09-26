import { ApiProperty } from '@nestjs/swagger';
import { BaseDTO } from 'src/core/utils/base.dto';
import { IsString, IsEnum, IsDateString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionLineDTO } from '../../transaction-line/dtos/transaction-line.dto';

export enum TransactionStatus {
  DRAFT = 'DRAFT',
  POSTED = 'POSTED',
  CANCELLED = 'CANCELLED',
}

export class TransactionDTO extends BaseDTO {
  @ApiProperty({ description: 'Unique transaction reference number', example: 'TXN-2024-00001' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Transaction date', example: '2024-01-15' })
  @IsDateString()
  date: Date;

  @ApiProperty({ description: 'Transaction description', example: 'Payment for supplies' })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Transaction status',
    enum: TransactionStatus,
    default: TransactionStatus.DRAFT,
  })
  @IsEnum(TransactionStatus)
  status: TransactionStatus;

  @ApiProperty({ description: 'Transaction lines', type: [TransactionLineDTO] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransactionLineDTO)
  transactionLines?: TransactionLineDTO[];
}
