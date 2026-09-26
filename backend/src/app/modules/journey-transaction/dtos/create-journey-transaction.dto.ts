import { ApiProperty, OmitType } from '@nestjs/swagger';
import { JourneyTransactionDTO } from './journey-transaction.dto';
import { IsNotEmpty } from 'class-validator';

export class CreateJourneyTransactionDTO extends OmitType(JourneyTransactionDTO, [
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'createdBy',
  'updatedBy',
  'deletedBy',
  'journey',
] as const) {
  @ApiProperty({ description: 'Journey id' })
  @IsNotEmpty()
  journeyId: number;
}
