export const OFFICE_REQUEST_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'] as const;
export type OfficeRequestStatus = (typeof OFFICE_REQUEST_STATUSES)[number];
