export const CUSTODY_STATUSES = ['ACTIVE', 'INACTIVE', 'CLOSED'] as const;
export type CustodyStatus = (typeof CUSTODY_STATUSES)[number];
