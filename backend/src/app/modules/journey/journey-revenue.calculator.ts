import { PricingSheetKind } from 'src/core/enums/pricing-sheet-kind';

export type DeliveryPriceAmounts = {
  basePrice?: number | string | null;
  additionalFees?: number | string | null;
  taxPrice?: number | string | null;
  totalPrice?: number | string | null;
};

const toNumber = (value: number | string | null | undefined): number => {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
};

export function unitPriceFromSheet(
  row: DeliveryPriceAmounts,
  kind: PricingSheetKind,
): number {
  if (kind === PricingSheetKind.WATANIA) {
    if (row.totalPrice != null && row.totalPrice !== '') {
      return toNumber(row.totalPrice);
    }
    return toNumber(row.basePrice) + toNumber(row.additionalFees) + toNumber(row.taxPrice);
  }

  if (row.basePrice != null && row.basePrice !== '') {
    return toNumber(row.basePrice);
  }
  return toNumber(row.totalPrice);
}

export function expectedRevenueFrom(unitPrice: number, quantity?: number | null): number | null {
  if (quantity == null || !Number.isFinite(Number(quantity))) return null;
  return roundMoney(unitPrice * Number(quantity));
}

export function actualRevenueFrom(unitPrice: number, bookWeight?: number | null): number | null {
  if (bookWeight == null || !Number.isFinite(Number(bookWeight))) return null;
  return roundMoney(unitPrice * Number(bookWeight));
}

export function commissionFromSalary(
  salary:
    | {
        commissionPerJourney?: number | string | null;
        commissionIsPercentage?: boolean | null;
      }
    | null
    | undefined,
  revenue: number | null,
): number | null {
  if (!salary || salary.commissionPerJourney == null || salary.commissionPerJourney === '') {
    return null;
  }
  const amount = Number(salary.commissionPerJourney);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  if (salary.commissionIsPercentage) {
    if (revenue == null) return null;
    return roundMoney((amount / 100) * revenue);
  }
  return roundMoney(amount);
}

/** Sheet nolon still owed after the custody already given to the driver. Not below zero. */
export function nolonExpenseRemainder(sheetNolon: number, custodyAlreadyGiven: number): number {
  const sheet = Number.isFinite(sheetNolon) ? sheetNolon : 0;
  const custody = Number.isFinite(custodyAlreadyGiven) ? custodyAlreadyGiven : 0;
  return roundMoney(Math.max(0, sheet - custody));
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}
