import { getNextTire } from '../get-next-tire';
import type { SelectedTire, TirePositionKey } from '../types';

const ALL: TirePositionKey[] = ['leftOuter', 'leftInner', 'rightOuter', 'rightInner'];
const allPositions = () => ALL;

describe('getNextTire', () => {
  it.each<[SelectedTire, SelectedTire | null]>([
    [
      { axleIndex: 0, positionKey: 'leftOuter' },
      { axleIndex: 0, positionKey: 'leftInner' },
    ],
    [
      { axleIndex: 0, positionKey: 'leftInner' },
      { axleIndex: 0, positionKey: 'rightInner' },
    ],
    [
      { axleIndex: 0, positionKey: 'rightInner' },
      { axleIndex: 0, positionKey: 'rightOuter' },
    ],
    [
      { axleIndex: 0, positionKey: 'rightOuter' },
      { axleIndex: 1, positionKey: 'leftOuter' },
    ],
    [{ axleIndex: 1, positionKey: 'rightOuter' }, null],
  ])('after %j comes %j', (current, expected) => {
    expect(getNextTire(current, 2, allPositions)).toEqual(expected);
  });

  it('skips positions an axle does not have', () => {
    const steer = (axleIndex: number): TirePositionKey[] =>
      axleIndex === 0 ? ['leftOuter', 'rightOuter'] : ALL;
    expect(getNextTire({ axleIndex: 0, positionKey: 'leftOuter' }, 2, steer)).toEqual({
      axleIndex: 0,
      positionKey: 'rightOuter',
    });
  });
});
