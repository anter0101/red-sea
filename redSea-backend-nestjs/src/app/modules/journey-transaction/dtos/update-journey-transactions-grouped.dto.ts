import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import {
  JourneyTransactionsGroupedDTO,
  JourneyTransactionItemDTO,
} from './create-journey-transactions-grouped.dto';
import { UpdateJourneyTransactionDTO } from './update-journey-transaction.dto';

// Item DTO for bulk update: same as create item but with id so we can target
export class JourneyTransactionUpdateItemDTO extends OmitType(
  JourneyTransactionItemDTO,
  [] as const,
) {
  @ApiProperty({ description: 'Transaction id to update' })
  id: number;
}

export class JourneyTransactionsBulkUpdateDTO extends OmitType(JourneyTransactionsGroupedDTO, [
  'transactions',
  'transactionType',
] as const) {
  @ApiProperty({ type: [UpdateJourneyTransactionDTO] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateJourneyTransactionDTO)
  transactions: (UpdateJourneyTransactionDTO & { id: number })[];
}
