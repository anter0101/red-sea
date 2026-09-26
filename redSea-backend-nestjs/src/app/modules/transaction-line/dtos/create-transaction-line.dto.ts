import { PickType, ApiProperty } from '@nestjs/swagger';
import { TransactionLineDTO } from './transaction-line.dto';
import { IsInt, IsNumber, Min } from 'class-validator';

export class CreateTransactionLineDTO extends PickType(TransactionLineDTO, [
  'entryType',
  'description',
] as const) {
  @ApiProperty({ description: 'Account ID' })
  @IsInt()
  accountId: number;

  @ApiProperty({ description: 'Line amount (must be > 0)', example: 1000.0 })
  @IsNumber()
  @Min(0.01, { message: 'Amount must be greater than zero' })
  amount: number;
}
