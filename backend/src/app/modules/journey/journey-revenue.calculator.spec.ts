import { PricingSheetKind } from 'src/core/enums/pricing-sheet-kind';
import {
  actualRevenueFrom,
  commissionFromSalary,
  expectedRevenueFrom,
  nolonExpenseRemainder,
  unitPriceFromSheet,
} from './journey-revenue.calculator';

describe('journey-revenue.calculator', () => {
  it('computes Watania x as مطالبة + سعر الطن + ضريبة', () => {
    expect(
      unitPriceFromSheet(
        { basePrice: 100, additionalFees: 20, taxPrice: 14 },
        PricingSheetKind.WATANIA,
      ),
    ).toBe(134);
  });

  it('prefers stored totalPrice for Watania', () => {
    expect(
      unitPriceFromSheet(
        { basePrice: 100, additionalFees: 20, taxPrice: 14, totalPrice: 130 },
        PricingSheetKind.WATANIA,
      ),
    ).toBe(130);
  });

  it('uses packing-type basePrice for Arish', () => {
    expect(
      unitPriceFromSheet({ basePrice: 85, additionalFees: 0, taxPrice: 0 }, PricingSheetKind.ARISH),
    ).toBe(85);
  });

  it('multiplies expected by quantity and actual by book weight', () => {
    expect(expectedRevenueFrom(10, 20)).toBe(200);
    expect(actualRevenueFrom(10, 18.5)).toBe(185);
    expect(expectedRevenueFrom(10, null)).toBeNull();
  });

  it('subtracts custody already given from the sheet nolon and does not go below zero', () => {
    expect(nolonExpenseRemainder(50, 20)).toBe(30);
    expect(nolonExpenseRemainder(50, 50)).toBe(0);
    expect(nolonExpenseRemainder(50, 80)).toBe(0);
    expect(nolonExpenseRemainder(50.5, 0.2)).toBe(50.3);
  });

  it('computes salary commission as % of revenue or as a fixed amount', () => {
    expect(
      commissionFromSalary({ commissionPerJourney: 10, commissionIsPercentage: true }, 200),
    ).toBe(20);
    expect(
      commissionFromSalary({ commissionPerJourney: 50, commissionIsPercentage: false }, 200),
    ).toBe(50);
    expect(commissionFromSalary(null, 200)).toBeNull();
  });
});
