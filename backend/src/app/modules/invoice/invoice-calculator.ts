export interface InvoiceTotalsInput {
  revenue: number;
  taxEnabled: boolean;
  vatPercentage: number;
  withholdingPercentage: number;
}

export interface InvoiceTotals {
  totalRevenue: number;
  vatAmount: number;
  withholdingAmount: number;
  netAmount: number;
}

export function roundMoney(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100) / 100;
}

/**
 * VAT and withholding are rounded first. The net is taken from those rounded amounts,
 * so the journal stays balanced: debits T + W + (T + V - W) equal credits T + T + V.
 */
export function invoiceTotals(input: InvoiceTotalsInput): InvoiceTotals {
  const totalRevenue = roundMoney(input.revenue);
  const vatRate = Number.isFinite(input.vatPercentage) ? input.vatPercentage : 0;
  const withholdingRate = Number.isFinite(input.withholdingPercentage)
    ? input.withholdingPercentage
    : 0;
  const vatAmount = input.taxEnabled ? roundMoney((totalRevenue * vatRate) / 100) : 0;
  const withholdingAmount = roundMoney((totalRevenue * withholdingRate) / 100);
  const netAmount = roundMoney(totalRevenue + vatAmount - withholdingAmount);
  return { totalRevenue, vatAmount, withholdingAmount, netAmount };
}
