import { JourneyDelegationPrintStatus } from 'src/core/enums/journey-delegation-print';
import { JourneyStatus } from 'src/core/enums/journey';
import { JourneyDelegationPrint } from './journey-delegation-print.entity';
import { JourneyDelegationPrintDTO } from './dtos/journey-delegation-print.dto';

export function delegationPrintIsAllowed(record: JourneyDelegationPrint): boolean {
  return (
    record.status === JourneyDelegationPrintStatus.APPROVED &&
    record.journey?.tripStatus === JourneyStatus.DELEGATION_ISSUED
  );
}

export function mapJourneyDelegationPrintToDto(
  record: JourneyDelegationPrint,
): JourneyDelegationPrintDTO {
  return {
    journeyId: record.journey.id,
    delegateNumber: record.journey.delegateNumber,
    status: record.status,
    canPrint: delegationPrintIsAllowed(record),
  };
}
