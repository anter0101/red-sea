import type { TripPolicyFormValues } from './activity-schema';
import type { ITripPolicyExpenses } from './policy';
import { TripTransactionCategory } from './transactions';

/** Nolon and contract cars pay the transport supplier; only the other cars settle driver custody. */
export function hasDriverExpenses(ownerShip?: string | null): boolean {
  if (!ownerShip) {
    return false;
  }
  return ownerShip !== 'NOLON_CAR' && ownerShip !== 'CONTRACT_CAR';
}

export const POLICY_EXPENSE_FIELDS = [
  { name: 'dieselFees', category: TripTransactionCategory.DIESEL_FEES, label: 'سولار' },
  { name: 'cardFees', category: TripTransactionCategory.CARD_FEES, label: 'كارته' },
  { name: 'scaleFees', category: TripTransactionCategory.WEIGHING_FEES, label: 'ميزان' },
  { name: 'tipsFees', category: TripTransactionCategory.TIPS_FEES, label: 'اكراميات' },
] as const;

export function buildPolicyExpenses(
  values: TripPolicyFormValues,
  ownerShip?: string | null,
): ITripPolicyExpenses | undefined {
  if (!hasDriverExpenses(ownerShip)) {
    return undefined;
  }
  const cardName = values.cardName?.trim();
  return {
    dieselFees: values.dieselFees ?? 0,
    fuelLiters: values.fuelLiters,
    cardFees: values.cardFees ?? 0,
    cardName: cardName || undefined,
    scaleFees: values.scaleFees ?? 0,
    tipsFees: values.tipsFees ?? 0,
  };
}
