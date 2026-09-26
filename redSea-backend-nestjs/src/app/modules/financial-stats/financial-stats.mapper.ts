import { LedgerReport, LedgerEntry } from './services/ledger.service';
import {
  TrialBalanceReport,
  TrialBalanceLine,
  TrialBalanceTreeNode,
} from './services/trial-balance.service';
import {
  IncomeStatementReport,
  IncomeStatementLine,
  IncomeStatementTreeNode,
} from './services/income-statement.service';
import {
  BalanceSheetReport,
  BalanceSheetLine,
  BalanceSheetTreeNode,
} from './services/balance-sheet.service';
import {
  LedgerReportDTO,
  LedgerEntryDTO,
  LedgerAccountInfoDTO,
  TrialBalanceReportDTO,
  TrialBalanceLineDTO,
  TrialBalanceTreeNodeDTO,
  IncomeStatementReportDTO,
  IncomeStatementLineDTO,
  IncomeStatementTreeNodeDTO,
  BalanceSheetReportDTO,
  BalanceSheetLineDTO,
  BalanceSheetTreeNodeDTO,
} from './dtos/financial-stats.response.dto';

// ── Ledger ───────────────────────────────────────────────────────────────────

function mapLedgerEntry(e: LedgerEntry): LedgerEntryDTO {
  const dto = new LedgerEntryDTO();
  dto.date = e.date;
  dto.transactionCode = e.transactionCode;
  dto.description = e.description;
  dto.debit = e.debit;
  dto.credit = e.credit;
  dto.balance = e.balance;
  return dto;
}

export function mapLedgerReport(report: LedgerReport): LedgerReportDTO {
  const account = new LedgerAccountInfoDTO();
  account.id = report.account.id;
  account.code = report.account.code;
  account.name = report.account.name;
  account.type = report.account.type as any;
  account.normalBalance = report.account.normalBalance as any;

  const dto = new LedgerReportDTO();
  dto.account = account;
  dto.dateFrom = report.dateFrom;
  dto.dateTo = report.dateTo;
  dto.openingBalance = report.openingBalance;
  dto.lines = report.lines.map(mapLedgerEntry);
  dto.closingBalance = report.closingBalance;
  dto.periodTotalDebits = report.periodTotalDebits;
  dto.periodTotalCredits = report.periodTotalCredits;
  dto.periodClosingBalance = report.periodClosingBalance;
  return dto;
}

// ── Trial Balance ────────────────────────────────────────────────────────────

function mapTrialBalanceLine(l: TrialBalanceLine): TrialBalanceLineDTO {
  const dto = new TrialBalanceLineDTO();
  dto.accountId = l.accountId;
  dto.accountCode = l.accountCode;
  dto.accountName = l.accountName;
  dto.accountType = l.accountType;
  dto.normalBalance = l.normalBalance;
  dto.totalDebit = l.totalDebit;
  dto.totalCredit = l.totalCredit;
  dto.balance = l.balance;
  dto.openingBalance = l.openingBalance;
  dto.openingDebit = l.openingDebit;
  dto.openingCredit = l.openingCredit;
  dto.closingBalance = l.closingBalance;
  dto.closingDebit = l.closingDebit;
  dto.closingCredit = l.closingCredit;
  return dto;
}

function mapTrialBalanceTree(n: TrialBalanceTreeNode): TrialBalanceTreeNodeDTO {
  const base = mapTrialBalanceLine(n);
  const dto = Object.assign(new TrialBalanceTreeNodeDTO(), base);
  if (n.children?.length) {
    dto.children = n.children.map(mapTrialBalanceTree);
  }
  return dto;
}

export function mapTrialBalanceReport(report: TrialBalanceReport): TrialBalanceReportDTO {
  const dto = new TrialBalanceReportDTO();
  dto.flat = report.flat;
  dto.dateFrom = report.dateFrom;
  dto.dateTo = report.dateTo;
  if (report.flat) {
    dto.lines = (report.lines ?? []).map(mapTrialBalanceLine);
  } else {
    dto.tree = (report.tree ?? []).map(mapTrialBalanceTree);
  }
  dto.grandTotalDebit = report.grandTotalDebit;
  dto.grandTotalCredit = report.grandTotalCredit;
  dto.grandOpeningDebit = report.grandOpeningDebit;
  dto.grandOpeningCredit = report.grandOpeningCredit;
  dto.isBalanced = report.isBalanced;
  return dto;
}

// ── Income Statement ─────────────────────────────────────────────────────────

function mapIncomeStatementLine(l: IncomeStatementLine): IncomeStatementLineDTO {
  const dto = new IncomeStatementLineDTO();
  dto.accountId = l.accountId;
  dto.accountCode = l.accountCode;
  dto.accountName = l.accountName;
  dto.accountType = l.accountType;
  dto.amount = l.amount;
  return dto;
}

function mapIncomeStatementTree(n: IncomeStatementTreeNode): IncomeStatementTreeNodeDTO {
  const base = mapIncomeStatementLine(n);
  const dto = Object.assign(new IncomeStatementTreeNodeDTO(), base);
  if (n.children?.length) {
    dto.children = n.children.map(mapIncomeStatementTree);
  }
  return dto;
}

export function mapIncomeStatementReport(report: IncomeStatementReport): IncomeStatementReportDTO {
  const dto = new IncomeStatementReportDTO();
  dto.flat = report.flat;
  dto.dateFrom = report.dateFrom;
  dto.dateTo = report.dateTo;
  if (report.flat) {
    dto.revenues = (report.revenues ?? []).map(mapIncomeStatementLine);
    dto.expenses = (report.expenses ?? []).map(mapIncomeStatementLine);
  } else {
    dto.revenueTree = (report.revenueTree ?? []).map(mapIncomeStatementTree);
    dto.expenseTree = (report.expenseTree ?? []).map(mapIncomeStatementTree);
  }
  dto.totalRevenue = report.totalRevenue;
  dto.totalExpenses = report.totalExpenses;
  dto.netIncome = report.netIncome;
  return dto;
}

// ── Balance Sheet ────────────────────────────────────────────────────────────

function mapBalanceSheetLine(l: BalanceSheetLine): BalanceSheetLineDTO {
  const dto = new BalanceSheetLineDTO();
  dto.accountId = l.accountId;
  dto.accountCode = l.accountCode;
  dto.accountName = l.accountName;
  dto.accountType = l.accountType;
  dto.balance = l.balance;
  if (l.balancePriorYear !== undefined) {
    dto.balancePriorYear = l.balancePriorYear;
  }
  return dto;
}

function mapBalanceSheetTree(n: BalanceSheetTreeNode): BalanceSheetTreeNodeDTO {
  const base = mapBalanceSheetLine(n);
  const dto = Object.assign(new BalanceSheetTreeNodeDTO(), base);
  if (n.children?.length) {
    dto.children = n.children.map(mapBalanceSheetTree);
  }
  return dto;
}

export function mapBalanceSheetReport(report: BalanceSheetReport): BalanceSheetReportDTO {
  const dto = new BalanceSheetReportDTO();
  dto.flat = report.flat;
  dto.asOf = report.asOf;
  dto.comparePriorYear = report.comparePriorYear;
  if (report.asOfPriorYear !== undefined) dto.asOfPriorYear = report.asOfPriorYear;
  if (report.flat) {
    dto.assets = (report.assets ?? []).map(mapBalanceSheetLine);
    dto.liabilities = (report.liabilities ?? []).map(mapBalanceSheetLine);
    dto.equity = (report.equity ?? []).map(mapBalanceSheetLine);
  } else {
    dto.assetTree = (report.assetTree ?? []).map(mapBalanceSheetTree);
    dto.liabilityTree = (report.liabilityTree ?? []).map(mapBalanceSheetTree);
    dto.equityTree = (report.equityTree ?? []).map(mapBalanceSheetTree);
  }
  dto.totalAssets = report.totalAssets;
  dto.totalLiabilities = report.totalLiabilities;
  dto.totalEquity = report.totalEquity;
  if (report.totalAssetsPriorYear !== undefined)
    dto.totalAssetsPriorYear = report.totalAssetsPriorYear;
  if (report.totalLiabilitiesPriorYear !== undefined) {
    dto.totalLiabilitiesPriorYear = report.totalLiabilitiesPriorYear;
  }
  if (report.totalEquityPriorYear !== undefined)
    dto.totalEquityPriorYear = report.totalEquityPriorYear;
  dto.isBalanced = report.isBalanced;
  if (report.isBalancedPriorYear !== undefined)
    dto.isBalancedPriorYear = report.isBalancedPriorYear;
  return dto;
}
