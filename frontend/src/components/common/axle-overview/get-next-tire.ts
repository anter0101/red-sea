import { PHYSICAL_SLOT_ORDER, type SelectedTire, type TirePositionKey } from './types';

/**
 * The tire after `current`, walking each axle in the diagram's order
 * (left outer → left inner → right inner → right outer), then the next axle.
 * Returns null after the last tire.
 */
export function getNextTire(
  current: SelectedTire,
  axleCount: number,
  getPositionsForAxle: (axleIndex: number) => TirePositionKey[],
): SelectedTire | null {
  const ordered = (axleIndex: number) => {
    const available = getPositionsForAxle(axleIndex);
    return PHYSICAL_SLOT_ORDER.filter((position) => available.includes(position));
  };

  const onAxle = ordered(current.axleIndex);
  const next = onAxle[onAxle.indexOf(current.positionKey) + 1];
  if (next) {
    return { axleIndex: current.axleIndex, positionKey: next };
  }

  for (let axleIndex = current.axleIndex + 1; axleIndex < axleCount; axleIndex++) {
    const [first] = ordered(axleIndex);
    if (first) {
      return { axleIndex, positionKey: first };
    }
  }
  return null;
}
