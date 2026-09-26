export enum PackingType {
  BAGGED = 'BAGGED',
  JUMBO_BAG = 'JUMBO_BAG',
  SILO10 = 'SILO10',
  SILO12 = 'SILO12',
  LOOSE = 'LOOSE',
}

export const packingTypeLabels: Record<PackingType, string> = {
  [PackingType.BAGGED]: 'معبأ',
  [PackingType.JUMBO_BAG]: 'جامبو',
  [PackingType.SILO10]: 'سليو %10',
  [PackingType.SILO12]: 'سليو %12',
  [PackingType.LOOSE]: 'سايب',
};
