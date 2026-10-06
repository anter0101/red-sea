import { servicesClaimLines } from '../services-claim-lines';

describe('servicesClaimLines', () => {
  it('groups tons by governorate and packing type, then multiplies by the claim rate', () => {
    const lines = servicesClaimLines([
      { governorate: 'القليوبية', packingType: 'BAGGED', quantity: 40, claimUnitPrice: 190.27 },
      { governorate: 'القليوبية', packingType: 'BAGGED', quantity: 30, claimUnitPrice: 190.27 },
      { governorate: 'الشرقية', packingType: 'BAGGED', quantity: 70, claimUnitPrice: 202.51 },
      { governorate: 'سوهاج', packingType: 'BAGGED', quantity: 70, claimUnitPrice: 258.23 },
      { governorate: 'القليوبية', packingType: 'BAGGED', quantity: 10, claimUnitPrice: null },
    ]);

    expect(lines).toEqual([
      {
        governorate: 'القليوبية',
        packingType: 'BAGGED',
        quantity: 70,
        unitPrice: 190.27,
        value: 13318.9,
      },
      {
        governorate: 'الشرقية',
        packingType: 'BAGGED',
        quantity: 70,
        unitPrice: 202.51,
        value: 14175.7,
      },
      {
        governorate: 'سوهاج',
        packingType: 'BAGGED',
        quantity: 70,
        unitPrice: 258.23,
        value: 18076.1,
      },
    ]);
    expect(lines.reduce((sum, row) => sum + row.quantity, 0)).toBe(210);
    expect(lines.reduce((sum, row) => sum + row.value, 0)).toBeCloseTo(45570.7, 2);
  });

  it('keeps two prices in the same governorate on separate rows', () => {
    const lines = servicesClaimLines([
      { governorate: 'القليوبية', packingType: 'BAGGED', quantity: 10, claimUnitPrice: 190.27 },
      { governorate: 'القليوبية', packingType: 'BAGGED', quantity: 10, claimUnitPrice: 100 },
    ]);
    expect(lines).toHaveLength(2);
    expect(lines.map((row) => row.value)).toEqual([1902.7, 1000]);
  });
});
