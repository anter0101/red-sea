import { invoiceTotals } from './invoice-calculator';

describe('invoiceTotals', () => {
  it('drops VAT when tax is off and keeps the withholding', () => {
    expect(
      invoiceTotals({
        revenue: 1000,
        taxEnabled: false,
        vatPercentage: 14,
        withholdingPercentage: 3,
      }),
    ).toEqual({ totalRevenue: 1000, vatAmount: 0, withholdingAmount: 30, netAmount: 970 });
  });

  it('adds VAT and subtracts withholding when tax is on', () => {
    expect(
      invoiceTotals({
        revenue: 1000,
        taxEnabled: true,
        vatPercentage: 14,
        withholdingPercentage: 3,
      }),
    ).toEqual({ totalRevenue: 1000, vatAmount: 140, withholdingAmount: 30, netAmount: 1110 });
  });

  it('rounds VAT and withholding before the net', () => {
    const totals = invoiceTotals({
      revenue: 10.01,
      taxEnabled: true,
      vatPercentage: 14,
      withholdingPercentage: 3,
    });
    expect(totals.vatAmount).toBe(1.4);
    expect(totals.withholdingAmount).toBe(0.3);
    expect(totals.netAmount).toBe(11.11);
  });

  it('stays balanced with tax on and with tax off', () => {
    for (const taxEnabled of [true, false]) {
      const totals = invoiceTotals({
        revenue: 12395.55,
        taxEnabled,
        vatPercentage: 14,
        withholdingPercentage: 3,
      });
      const debits = totals.totalRevenue + totals.withholdingAmount + totals.netAmount;
      const credits = totals.totalRevenue + totals.totalRevenue + totals.vatAmount;
      expect(Math.round(debits * 100)).toBe(Math.round(credits * 100));
    }
  });

  it('treats a missing rate as zero', () => {
    expect(
      invoiceTotals({
        revenue: 100,
        taxEnabled: true,
        vatPercentage: Number.NaN,
        withholdingPercentage: Number.NaN,
      }),
    ).toEqual({ totalRevenue: 100, vatAmount: 0, withholdingAmount: 0, netAmount: 100 });
  });
});
