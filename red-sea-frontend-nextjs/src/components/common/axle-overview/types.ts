export type TirePositionKey = 'leftOuter' | 'leftInner' | 'rightOuter' | 'rightInner';

export type SelectedTire = {
  axleIndex: number;
  positionKey: TirePositionKey;
};

export type TireSlotState = {
  filled: boolean;
  hasError: boolean;
};

/** Physical L→R order for chassis diagram (always LTR). */
export const PHYSICAL_SLOT_ORDER: TirePositionKey[] = [
  'leftOuter',
  'leftInner',
  'rightInner',
  'rightOuter',
];
