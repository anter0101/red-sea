export const TIRE_POSITIONS = ['leftOuter', 'leftInner', 'rightOuter', 'rightInner'] as const;

export type TirePosition = (typeof TIRE_POSITIONS)[number];

export type TireSnapshot = {
  serialNumber: string;
  type: string;
  healthPercentage: string;
  createdDate?: string;
};

export type TireSelection = {
  axleNumber: number;
  position: TirePosition;
  tireId?: number;
  location: string;
  previous?: TireSnapshot;
  next?: TireSnapshot;
};
