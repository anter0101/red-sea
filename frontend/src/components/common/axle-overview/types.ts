export type TirePositionKey = 'leftOuter' | 'leftInner' | 'rightOuter' | 'rightInner';

export type SelectedTire = {
  axleIndex: number;
  positionKey: TirePositionKey;
};

export type TireSlotState = {
  filled: boolean;
  hasError: boolean;
  selected?: boolean;
  disabled?: boolean;
  /** Empty box printed beside the tire so it can be marked by hand. */
  showCheckbox?: boolean;
  /** Short lines shown beside the tire on the print sheet. */
  lines?: string[];
};

/** Physical L→R order for chassis diagram (always LTR). */
export const PHYSICAL_SLOT_ORDER: TirePositionKey[] = [
  'leftOuter',
  'leftInner',
  'rightInner',
  'rightOuter',
];
