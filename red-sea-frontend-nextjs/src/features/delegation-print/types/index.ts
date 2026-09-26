export type JourneyDelegationPrintStatus = 'NOT_PRINTED' | 'PRINTED';

export interface IJourneyDelegationPrintResponse {
  journeyId: number;
  status: JourneyDelegationPrintStatus;
  canPrint: boolean;
}
