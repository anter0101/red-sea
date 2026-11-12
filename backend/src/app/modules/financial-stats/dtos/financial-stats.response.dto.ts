import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { AccountType, normalBalanceType } from '../../account/account.entity';

// ── General Ledger ───────────────────────────────────────────────────────────

export class LedgerAccountInfoDTO {
  @ApiProperty({ example: 9 }) id: number;
  @ApiProperty({ example: 'A-202604049' }) code: string;
  @ApiProperty({ example: 'Cash' }) name: string;
  @ApiProperty({ enum: AccountType }) type: AccountType;
  @ApiProperty({ enum: normalBalanceType }) normalBalance: normalBalanceType;
}

export class LedgerEntryDTO {
  @ApiProperty({ example: '2024-01-01' }) date: Date;
  @ApiProperty({ example: 'TRN-20240001' }) transactionCode: string;
  @ApiProperty({ example: 'Initial Capital Investment' }) description: string;
  @ApiProperty({ example: 100000 }) debit: number;
  @ApiProperty({ example: 0 }) credit: number;
  @ApiProperty({ description: 'Running balance after this entry', example: 100000 })
  balance: number;
}

export class LedgerReportDTO {
  @ApiProperty({ type: LedgerAccountInfoDTO }) account: LedgerAccountInfoDTO;
  @ApiPropertyOptional({ example: '2024-01-01' }) dateFrom?: string;
  @ApiPropertyOptional({ example: '2024-03-31' }) dateTo?: string;
  @ApiProperty({
    description:
      'Balance at period start: stored account opening balance + POSTED activity strictly before dateFrom (dateFrom omitted: stored opening only).',
    example: 0,
  })
  openingBalance: number;
  @ApiProperty({ type: [LedgerEntryDTO] }) lines: LedgerEntryDTO[];
  @ApiProperty({ description: 'Running balance at the last entry on this page', example: 150000 })
  closingBalance: number;
  @ApiProperty({ description: 'Total debits across the full period', example: 205000 })
  periodTotalDebits: number;
  @ApiProperty({ description: 'Total credits across the full period', example: 40000 })
  periodTotalCredits: number;
  @ApiProperty({ description: 'Net balance at the end of the full period', example: 165000 })
  periodClosingBalance: number;
}

// ── Trial Balance ────────────────────────────────────────────────────────────

export class TrialBalanceLineDTO {
  @ApiProperty({ example: 9 }) accountId: number;
  @ApiProperty({ example: 'A-202604049' }) accountCode: string;
  @ApiProperty({ example: 'Cash' }) accountName: string;
  @ApiProperty({ enum: AccountType }) accountType: AccountType;
  @ApiProperty({ enum: normalBalanceType }) normalBalance: normalBalanceType;
  @ApiProperty({ description: 'POSTED debits in the selected period', example: 205000 })
  totalDebit: number;
  @ApiProperty({ description: 'POSTED credits in the selected period', example: 40000 })
  totalCredit: number;
  @ApiProperty({
    description: 'Net period movement (signed, normal-balance convention)',
    example: 165000,
  })
  balance: number;
  @ApiProperty({
    description:
      'Start of period: stored opening balance + POSTED activity before dateFrom (or stored only if no dateFrom)',
    example: 10000,
  })
  openingBalance: number;
  @ApiProperty({ description: 'Opening split to debit column for TB presentation', example: 10000 })
  openingDebit: number;
  @ApiProperty({ description: 'Opening split to credit column for TB presentation', example: 0 })
  openingCredit: number;
  @ApiProperty({
    description: 'End of period: openingBalance + signed period movement',
    example: 181000,
  })
  closingBalance: number;
  @ApiProperty({ description: 'Closing split to debit column', example: 181000 })
  closingDebit: number;
  @ApiProperty({ description: 'Closing split to credit column', example: 0 })
  closingCredit: number;
}

export class TrialBalanceTreeNodeDTO extends TrialBalanceLineDTO {
  @ApiPropertyOptional({
    description: 'Child accounts (same fields rolled up at each parent)',
    type: () => [TrialBalanceTreeNodeDTO],
  })
  @Type(() => TrialBalanceTreeNodeDTO)
  children?: TrialBalanceTreeNodeDTO[];
}

export class TrialBalanceReportDTO {
  @ApiProperty({ description: 'Legacy flat layout when true', example: false }) flat: boolean;
  @ApiPropertyOptional({ example: '2024-01-01' }) dateFrom?: string;
  @ApiPropertyOptional({ example: '2024-03-31' }) dateTo?: string;
  @ApiPropertyOptional({ type: [TrialBalanceLineDTO], description: 'Present when flat=true' })
  lines?: TrialBalanceLineDTO[];
  @ApiPropertyOptional({ type: [TrialBalanceTreeNodeDTO], description: 'Present when flat=false' })
  tree?: TrialBalanceTreeNodeDTO[];
  @ApiProperty({ description: 'Grand total period debits', example: 395000 })
  grandTotalDebit: number;
  @ApiProperty({ description: 'Grand total period credits', example: 395000 })
  grandTotalCredit: number;
  @ApiProperty({ description: 'Sum of openingDebit across lines', example: 120000 })
  grandOpeningDebit: number;
  @ApiProperty({ description: 'Sum of openingCredit across lines', example: 120000 })
  grandOpeningCredit: number;
  @ApiProperty({
    description: 'True when |grandTotalDebit − grandTotalCredit| < 0.01 (period totals)',
    example: true,
  })
  isBalanced: boolean;
}

// ── Income Statement ─────────────────────────────────────────────────────────

export class IncomeStatementLineDTO {
  @ApiProperty({ example: 20 }) accountId: number;
  @ApiProperty({ example: 'A-2026040420' }) accountCode: string;
  @ApiProperty({ example: 'Transportation Revenue' }) accountName: string;
  @ApiProperty({ enum: AccountType }) accountType: AccountType;
  @ApiProperty({
    description: 'Net amount: credits−debits for REVENUE, debits−credits for EXPENSE',
    example: 80000,
  })
  amount: number;
}

export class IncomeStatementTreeNodeDTO extends IncomeStatementLineDTO {
  @ApiPropertyOptional({ type: () => [IncomeStatementTreeNodeDTO] })
  @Type(() => IncomeStatementTreeNodeDTO)
  children?: IncomeStatementTreeNodeDTO[];
}

export class IncomeStatementReportDTO {
  @ApiProperty({ example: false }) flat: boolean;
  @ApiPropertyOptional({ example: '2024-01-01' }) dateFrom?: string;
  @ApiPropertyOptional({ example: '2024-03-30' }) dateTo?: string;
  @ApiPropertyOptional({ type: [IncomeStatementLineDTO], description: 'Present when flat=true' })
  revenues?: IncomeStatementLineDTO[];
  @ApiPropertyOptional({ type: [IncomeStatementLineDTO], description: 'Present when flat=true' })
  expenses?: IncomeStatementLineDTO[];
  @ApiPropertyOptional({
    type: [IncomeStatementTreeNodeDTO],
    description: 'Present when flat=false',
  })
  revenueTree?: IncomeStatementTreeNodeDTO[];
  @ApiPropertyOptional({
    type: [IncomeStatementTreeNodeDTO],
    description: 'Present when flat=false',
  })
  expenseTree?: IncomeStatementTreeNodeDTO[];
  @ApiProperty({ description: 'Total revenue — full dataset', example: 105000 })
  totalRevenue: number;
  @ApiProperty({ description: 'Total expenses — full dataset', example: 28000 })
  totalExpenses: number;
  @ApiProperty({ description: 'Net income = totalRevenue − totalExpenses', example: 77000 })
  netIncome: number;
}

// ── Balance Sheet ────────────────────────────────────────────────────────────

export class BalanceSheetLineDTO {
  @ApiProperty({ example: 9 }) accountId: number;
  @ApiProperty({ example: 'A-202604049' }) accountCode: string;
  @ApiProperty({ example: 'Cash' }) accountName: string;
  @ApiProperty({ enum: AccountType }) accountType: AccountType;
  @ApiProperty({
    description: 'Balance as of primary asOf (includes stored opening + cumulative POSTED)',
    example: 165000,
  })
  balance: number;
  @ApiPropertyOptional({
    description: 'When comparePriorYear=true: balance on the same calendar date one year earlier',
    example: 150000,
  })
  balancePriorYear?: number;
}

export class BalanceSheetTreeNodeDTO extends BalanceSheetLineDTO {
  @ApiPropertyOptional({ type: () => [BalanceSheetTreeNodeDTO] })
  @Type(() => BalanceSheetTreeNodeDTO)
  children?: BalanceSheetTreeNodeDTO[];
}

export class BalanceSheetReportDTO {
  @ApiProperty({ example: false }) flat: boolean;
  @ApiProperty({ example: '2024-03-31' }) asOf: string;
  @ApiProperty({ description: 'Whether prior-year column is included', example: false })
  comparePriorYear: boolean;
  @ApiPropertyOptional({
    example: '2023-03-31',
    description: 'Prior snapshot date when comparePriorYear is true',
  })
  asOfPriorYear?: string;
  @ApiPropertyOptional({ type: [BalanceSheetLineDTO], description: 'Present when flat=true' })
  assets?: BalanceSheetLineDTO[];
  @ApiPropertyOptional({ type: [BalanceSheetLineDTO], description: 'Present when flat=true' })
  liabilities?: BalanceSheetLineDTO[];
  @ApiPropertyOptional({ type: [BalanceSheetLineDTO], description: 'Present when flat=true' })
  equity?: BalanceSheetLineDTO[];
  @ApiPropertyOptional({ type: [BalanceSheetTreeNodeDTO], description: 'Present when flat=false' })
  assetTree?: BalanceSheetTreeNodeDTO[];
  @ApiPropertyOptional({ type: [BalanceSheetTreeNodeDTO], description: 'Present when flat=false' })
  liabilityTree?: BalanceSheetTreeNodeDTO[];
  @ApiPropertyOptional({ type: [BalanceSheetTreeNodeDTO], description: 'Present when flat=false' })
  equityTree?: BalanceSheetTreeNodeDTO[];
  @ApiProperty({ description: 'Total assets — primary asOf', example: 177000 }) totalAssets: number;
  @ApiProperty({ description: 'Total liabilities — primary asOf', example: 0 })
  totalLiabilities: number;
  @ApiProperty({ description: 'Total equity — primary asOf', example: 177000 }) totalEquity: number;
  @ApiPropertyOptional({
    description: 'Total assets — prior year when comparePriorYear',
    example: 160000,
  })
  totalAssetsPriorYear?: number;
  @ApiPropertyOptional({ description: 'Total liabilities — prior year', example: 0 })
  totalLiabilitiesPriorYear?: number;
  @ApiPropertyOptional({ description: 'Total equity — prior year', example: 160000 })
  totalEquityPriorYear?: number;
  @ApiProperty({ description: 'Equation check for primary snapshot', example: true })
  isBalanced: boolean;
  @ApiPropertyOptional({
    description: 'Equation check for prior snapshot when comparePriorYear',
    example: true,
  })
  isBalancedPriorYear?: boolean;
}

export class AccountingDashboardDTO {
  @ApiProperty({ description: 'Posted revenue in the period', example: 12395 })
  revenue: number;
  @ApiProperty({ description: 'Posted expenses in the period', example: 6000 })
  cost: number;
  @ApiProperty({ description: 'revenue − cost', example: 6395 })
  netProfit: number;
  @ApiProperty({
    description: 'Closing balance of عملاء (CLIENTS) at dateTo. What clients still owe.',
    example: 12023.15,
  })
  clients: number;
  @ApiProperty({
    description:
      'Closing balance of مورد النقل at dateTo. What we still owe suppliers.',
    example: 6000,
  })
  suppliers: number;
}
