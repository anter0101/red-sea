import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateJourneyTransactionDTO } from './create-journey-transaction.dto';

// For updates we don't need to send journeyId in the body;
// the target transaction is identified by the :id route param.
export class UpdateJourneyTransactionDTO extends PartialType(
  OmitType(CreateJourneyTransactionDTO, ['journeyId'] as const),
) {}
