import { OmitType } from '@nestjs/swagger';
import { TransactionDTO } from './transaction.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateTransactionLineDTO } from '../../transaction-line/dtos/create-transaction-line.dto';

export class CreateTransactionDTO extends OmitType(TransactionDTO, [
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'createdBy',
  'updatedBy',
  'deletedBy',
  'transactionLines',
  'code',
] as const) {
  @ApiProperty({ description: 'Transaction lines', type: [CreateTransactionLineDTO] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTransactionLineDTO)
  transactionLines: CreateTransactionLineDTO[];
}
