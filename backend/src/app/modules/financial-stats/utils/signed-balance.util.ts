import { normalBalanceType } from '../../account/account.entity';

/** Signed balance from period debit/credit totals using the account's normal balance side. */
export function signedBalanceFromTotals(
  totalDebit: number,
  totalCredit: number,
  normalBalance: normalBalanceType,
): number {
  return normalBalance === normalBalanceType.DEBIT
    ? totalDebit - totalCredit
    : totalCredit - totalDebit;
}

/**
 * Split a signed balance into trial-balance debit and credit columns (one side zero).
 * Positive signed balance for a debit-normal account sits on the debit column.
 */
export function splitSignedToDebitCreditColumns(
  signed: number,
  normalBalance: normalBalanceType,
): { debit: number; credit: number } {
  if (normalBalance === normalBalanceType.DEBIT) {
    if (signed >= 0) return { debit: signed, credit: 0 };
    return { debit: 0, credit: -signed };
  }
  if (signed >= 0) return { debit: 0, credit: signed };
  return { debit: -signed, credit: 0 };
}

/** Parse DB decimal / string to number. */
export function toNumber(v: unknown): number {
  if (v == null || v === '') return 0;
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  if (typeof v === 'string') {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  }
  if (typeof v === 'bigint') return Number(v);
  return 0;
}
