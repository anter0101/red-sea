export const OFFICE_REQUEST_TYPES = [
  'PRINT_DELEGATION',
  'END_WORKING_SHIFT',
  'ASK_FOR_CUSTODY',
] as const;
export type OfficeRequestType = (typeof OFFICE_REQUEST_TYPES)[number];
