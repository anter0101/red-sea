import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard, Roles, RolesGuard } from 'src/core/security';
import { UserRole } from 'src/core/enums/user-role';
import type { Request } from 'src/core/utils/request';
import { PageRequest, pageRequestSortString } from 'src/core/utils/pagination.entity';
import { HeaderUtil } from 'src/core/utils/header-util';

import { LedgerService } from '../services/ledger.service';
import { TrialBalanceService } from '../services/trial-balance.service';
import { IncomeStatementService } from '../services/income-statement.service';
import { BalanceSheetService } from '../services/balance-sheet.service';
import { DashboardSummaryService } from '../services/dashboard-summary.service';

import {
  mapLedgerReport,
  mapTrialBalanceReport,
  mapIncomeStatementReport,
  mapBalanceSheetReport,
} from '../financial-stats.mapper';

import {
  LedgerReportDTO,
  TrialBalanceReportDTO,
  IncomeStatementReportDTO,
  BalanceSheetReportDTO,
  AccountingDashboardDTO,
} from '../dtos/financial-stats.response.dto';

import { LedgerQueryDTO } from '../dtos/ledger-query.dto';
import { TrialBalanceQueryDTO } from '../dtos/trial-balance-query.dto';
import { IncomeStatementQueryDTO } from '../dtos/income-statement-query.dto';
import { BalanceSheetQueryDTO } from '../dtos/balance-sheet-query.dto';
import { DateRangeDTO } from '../dtos/date-range.dto';

@Controller('api/accounting/reports')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('accounting-reports')
export class FinancialStatsController {
  constructor(
    private readonly ledgerService: LedgerService,
    private readonly trialBalanceService: TrialBalanceService,
    private readonly incomeStatementService: IncomeStatementService,
    private readonly balanceSheetService: BalanceSheetService,
    private readonly dashboardSummaryService: DashboardSummaryService,
  ) {}

  // ─── General Ledger (paginated — can be 15k–180k rows) ────────────────────

  @Get('/ledger')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({
    summary: 'General Ledger',
    description:
      'Returns the full activity for one account: opening balance (stored opening + postings before the period), ' +
      'chronological POSTED transaction lines with running balance, and closing balance. ' +
      'Supports page / pageSize — X-Total-Count, Current-Page and Has-Next-Page are set in ' +
      'response headers. periodTotalDebits, periodTotalCredits and periodClosingBalance ' +
      'always reflect the full period regardless of the current page.',
  })
  @ApiOkResponse({ type: LedgerReportDTO })
  async getLedger(@Req() req: Request, @Query() query: LedgerQueryDTO): Promise<LedgerReportDTO> {
    const pageRequest = new PageRequest(
      +(query.page ?? 1),
      +(query.pageSize ?? 10),
      pageRequestSortString(query.sortField, query.sortOrder ?? undefined),
    );

    const report = await this.ledgerService.getLedger(query);

    HeaderUtil.addPaginationHeaders(
      req.res!,
      report.total,
      pageRequest.page + 1, // convert back to 1-indexed
      report.total > (pageRequest.page + 1) * pageRequest.size, // correct has-next check
    );

    return mapLedgerReport(report);
  }

  // ─── Trial Balance (~200 rows max — full dataset, no pagination) ───────────

  @Get('/trial-balance')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({
    summary: 'Trial Balance',
    description:
      'Per account: opening balance (stored opening + postings before dateFrom when set), period debits/credits, closing balance, and TB debit/credit columns for opening/closing. ' +
      'grandTotalDebit/Credit are period totals; grandOpeningDebit/Credit sum opening columns. isBalanced compares period debits vs credits. ' +
      'Query `flat=true` returns flat `lines`; default (`flat=false`) returns nested `tree` with rolled-up parent totals.',
  })
  @ApiOkResponse({ type: TrialBalanceReportDTO })
  async getTrialBalance(@Query() query: TrialBalanceQueryDTO): Promise<TrialBalanceReportDTO> {
    return mapTrialBalanceReport(await this.trialBalanceService.getTrialBalance(query));
  }

  // ─── Income Statement (~50 rows max — full dataset, no pagination) ─────────

  @Get('/income-statement')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({
    summary: 'Income Statement (Profit & Loss)',
    description:
      'Summarises REVENUE and EXPENSE accounts for the period. ' +
      'Returns all accounts in a single response (typically ≤50 rows). ' +
      'netIncome = totalRevenue − totalExpenses. `flat=true` uses flat `revenues`/`expenses`; default returns `revenueTree`/`expenseTree`.',
  })
  @ApiOkResponse({ type: IncomeStatementReportDTO })
  async getIncomeStatement(
    @Query() query: IncomeStatementQueryDTO,
  ): Promise<IncomeStatementReportDTO> {
    return mapIncomeStatementReport(await this.incomeStatementService.getIncomeStatement(query));
  }

  // ─── Balance Sheet (~100 rows max — full dataset, no pagination) ───────────

  @Get('/balance-sheet')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({
    summary: 'Balance Sheet',
    description:
      'Point-in-time snapshot of ASSET, LIABILITY and EQUITY (incl. CASH as asset) as of `asOf` (defaults to today). ' +
      'Balances include each account stored opening balance plus cumulative POSTED activity through `asOf`. ' +
      'Optional comparePriorYear adds balancePriorYear and prior-year totals. `flat=true` returns flat `assets`/`liabilities`/`equity`; default returns `assetTree`/`liabilityTree`/`equityTree`.',
  })
  @ApiOkResponse({ type: BalanceSheetReportDTO })
  async getBalanceSheet(@Query() query: BalanceSheetQueryDTO): Promise<BalanceSheetReportDTO> {
    return mapBalanceSheetReport(await this.balanceSheetService.getBalanceSheet(query));
  }

  @Get('/dashboard')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({
    summary: 'Accounting totals for the home screen',
    description:
      'Revenue, cost, and net profit are the income statement for dateFrom–dateTo. ' +
      'Clients is the closing balance of عملاء. Suppliers is the closing balance of مورد النقل, through dateTo.',
  })
  @ApiOkResponse({ type: AccountingDashboardDTO })
  async getDashboard(@Query() query: DateRangeDTO): Promise<AccountingDashboardDTO> {
    return Object.assign(
      new AccountingDashboardDTO(),
      await this.dashboardSummaryService.getSummary(query),
    );
  }
}
