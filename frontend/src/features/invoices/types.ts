export interface InvoiceTotals {
  totalRevenue: number;
  vatAmount: number;
  withholdingAmount: number;
  netAmount: number;
}

export interface InvoiceLedgerLine {
  kind: string;
  entryType: 'DEBIT' | 'CREDIT';
  amount: number;
  path: string;
}

export interface InvoicePreview {
  clientId: number;
  clientName: string;
  journeyCount: number;
  totals: InvoiceTotals;
  lines: InvoiceLedgerLine[];
}

export interface InvoiceJourneyRow {
  journeyId: number;
  delegateNumber: string | null;
  policyNo: string | null;
  revenueAmount: number;
  governorate: string | null;
  receivedCompany: string | null;
  packingType: string | null;
  destination: string | null;
  journeyDate: string | null;
  quantity: number | null;
  unitPrice: number;
}

export interface InvoiceView {
  id: number;
  code: string;
  date: string;
  clientId: number | null;
  clientName: string | null;
  companyName: string | null;
  taxCard: string | null;
  commercialRegister: string | null;
  taxEnabled: boolean;
  vatPercentage: number;
  withholdingPercentage: number;
  totalRevenue: number;
  vatAmount: number;
  withholdingAmount: number;
  netAmount: number;
  transactionId: number | null;
  journeyCount: number;
  journeys: InvoiceJourneyRow[];
}

export interface CreateInvoiceBody {
  clientId: number;
  journeyIds: number[];
  taxEnabled: boolean;
  vatPercentage: number;
  withholdingPercentage: number;
}
