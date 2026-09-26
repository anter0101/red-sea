export type JourneyDelegationPrintStatus = 'NOT_PRINTED' | 'APPROVED' | 'PRINTED';

export interface IJourneyDelegationPrintResponse {
  journeyId: number;
  delegateNumber?: string;
  status: JourneyDelegationPrintStatus;
  canPrint: boolean;
}
