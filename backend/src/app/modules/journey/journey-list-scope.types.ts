/** Role-based list restriction (e.g. DATA_ENTRY sees only own delegations). */
export interface JourneyListScope {
  custodySourceUserId?: number;
}
