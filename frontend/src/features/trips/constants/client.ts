export const CLIENTS = {
  ARISH: 'ARISH',
  WATANIA: 'WATANIA',
} as const;
export const CLIENT_LABELS = {
  [CLIENTS.ARISH]: 'مصنع العريش',
  [CLIENTS.WATANIA]: 'مصنع وطنية',
};

export const CLIENT_ID_MAP = {
  [CLIENTS.ARISH]: 1,
  [CLIENTS.WATANIA]: 2,
} as const;
