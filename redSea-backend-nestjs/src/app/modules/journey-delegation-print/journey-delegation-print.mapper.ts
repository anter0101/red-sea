import { JourneyDelegationPrintStatus } from 'src/core/enums/journey-delegation-print';
import { JourneyDelegationPrint } from './journey-delegation-print.entity';
import { JourneyDelegationPrintDTO } from './dtos/journey-delegation-print.dto';

export function mapJourneyDelegationPrintToDto(
  record: JourneyDelegationPrint,
): JourneyDelegationPrintDTO {
  return {
    journeyId: record.journey.id,
    status: record.status,
    canPrint: record.status === JourneyDelegationPrintStatus.NOT_PRINTED,
  };
}
