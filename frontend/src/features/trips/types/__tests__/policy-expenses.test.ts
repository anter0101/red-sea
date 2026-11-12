import type { TripPolicyFormValues } from '../activity-schema';
import { buildPolicyExpenses, hasDriverExpenses } from '../policy-expenses';

const values: TripPolicyFormValues = {
  dieselFees: 300,
  fuelLiters: 40,
  cardFees: 50,
  cardName: ' كارته السويس ',
  scaleFees: undefined,
  tipsFees: 20,
};

describe('policy expenses payload', () => {
  it('sends all four types for a company car, empty ones as 0', () => {
    expect(buildPolicyExpenses(values, 'COMPANY_CAR')).toEqual({
      dieselFees: 300,
      fuelLiters: 40,
      cardFees: 50,
      cardName: 'كارته السويس',
      scaleFees: 0,
      tipsFees: 20,
    });
  });

  it.each(['NOLON_CAR', 'CONTRACT_CAR', undefined, null])(
    'omits expenses for %s',
    (ownerShip) => {
      expect(buildPolicyExpenses(values, ownerShip)).toBeUndefined();
    },
  );

  it('shows the section only for cars that settle driver custody', () => {
    expect(hasDriverExpenses('COMPANY_CAR')).toBe(true);
    expect(hasDriverExpenses('SHARE')).toBe(true);
    expect(hasDriverExpenses('NOLON_CAR')).toBe(false);
    expect(hasDriverExpenses('CONTRACT_CAR')).toBe(false);
  });
});
