// src/journey-transaction/dtos/create-journey-transactions-grouped.dto.ts

import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { JourneyTransactionDTO } from './journey-transaction.dto';
import { JourneyTransactionType } from 'src/core/enums/journey';

// 1. Create transaction item DTO without relation & base fields
export class JourneyTransactionItemDTO extends OmitType(JourneyTransactionDTO, [
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'createdBy',
  'updatedBy',
  'deletedBy',
  'journey', // we attach this on backend
  'transactionType',
] as const) {}

// 2. The final DTO used in controller
export class JourneyTransactionsGroupedDTO {
  @ApiProperty({ example: 1, description: 'Journey ID' })
  @IsNumber()
  journeyId: number;

  @ApiProperty({ type: [JourneyTransactionItemDTO] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JourneyTransactionItemDTO)
  transactions: JourneyTransactionItemDTO[];

  @ApiProperty({ enum: JourneyTransactionType })
  @IsEnum(JourneyTransactionType)
  transactionType: JourneyTransactionType;
}
