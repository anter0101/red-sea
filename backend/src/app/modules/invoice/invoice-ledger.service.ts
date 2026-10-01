import { Account } from '../account/account.entity';
import { EntryType } from '../transaction-line/transaction-line.entity';
import { InvoiceTotals } from './invoice-calculator';

export type InvoiceLineKind =
  | 'REVENUE_IN_PROGRESS'
  | 'REVENUE_DONE'
  | 'WITHHOLDING_TAX'
  | 'CLIENTS_IN_PROGRESS'
  | 'CLIENT'
  | 'VAT';

export interface InvoiceLedgerLine {
  kind: InvoiceLineKind;
  entryType: EntryType;
  amount: number;
  path: string;
  account: Account;
}

export function accountPath(account: Account): string {
  const parent = account.parentAccount?.name;
  return parent ? `${parent} → ${account.name}` : account.name;
}

/** One compound journal. A zero amount is left out; the remaining lines still balance. */
export function buildInvoiceLines(args: {
  totals: InvoiceTotals;
  revenueInProgress: Account;
  revenueDone: Account;
  withholding: Account;
  clientsInProgress: Account;
  client: Account;
  vat: Account;
}): InvoiceLedgerLine[] {
  const { totals } = args;
  const candidates: InvoiceLedgerLine[] = [
    line('REVENUE_IN_PROGRESS', EntryType.DEBIT, totals.totalRevenue, args.revenueInProgress),
    line('REVENUE_DONE', EntryType.CREDIT, totals.totalRevenue, args.revenueDone),
    line('WITHHOLDING_TAX', EntryType.DEBIT, totals.withholdingAmount, args.withholding),
    line('CLIENTS_IN_PROGRESS', EntryType.CREDIT, totals.totalRevenue, args.clientsInProgress),
    line('CLIENT', EntryType.DEBIT, totals.netAmount, args.client),
    line('VAT', EntryType.CREDIT, totals.vatAmount, args.vat),
  ];
  return candidates.filter((entry) => entry.amount > 0);
}

function line(
  kind: InvoiceLineKind,
  entryType: EntryType,
  amount: number,
  account: Account,
): InvoiceLedgerLine {
  return { kind, entryType, amount, path: accountPath(account), account };
}
