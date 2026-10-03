import type { IAxle } from '@/types/axles';
import type { TirePositionKey } from './types';

export function findTireOnAxle(
  axles: IAxle[] | undefined,
  axleIndex: number,
  position: TirePositionKey,
  getLocation: (position: TirePositionKey, axleIndex: number) => string,
) {
  const location = getLocation(position, axleIndex);
  const axle = axles?.find((item) => item.number === axleIndex + 1) ?? axles?.[axleIndex];
  const tire = axle?.tires?.find((item) => item.location === location);
  return {
    location,
    tire,
    axleNumber: axle?.number ?? axleIndex + 1,
    filled: Boolean(tire),
  };
}
