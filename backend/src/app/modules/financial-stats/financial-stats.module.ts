import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Account } from '../account/account.entity';
import { TransactionLine } from '../transaction-line/transaction-line.entity';

import { FinancialStatsController } from './controllers/financial-stats.controller';
import { LedgerService } from './services/ledger.service';
import { TrialBalanceService } from './services/trial-balance.service';
import { IncomeStatementService } from './services/income-statement.service';
import { BalanceSheetService } from './services/balance-sheet.service';
import { DashboardSummaryService } from './services/dashboard-summary.service';

@Module({
  imports: [
    // Register only the repositories this module directly injects.
    // Relation traversal (tl → transaction, tl → account) is handled by TypeORM
    // through the entity metadata registered in their respective feature modules.
    TypeOrmModule.forFeature([Account, TransactionLine]),
  ],
  controllers: [FinancialStatsController],
  providers: [
    LedgerService,
    TrialBalanceService,
    IncomeStatementService,
    BalanceSheetService,
    DashboardSummaryService,
  ],
})
export class FinancialStatsModule {}
