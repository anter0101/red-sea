import { Test } from '@nestjs/testing';
import { CanActivate, ExecutionContext, INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';

import { AuthGuard, RolesGuard } from 'src/core/security';
import { UserRole } from 'src/core/enums/user-role';

import { AccountController } from './account/account.controller';
import { AccountService } from './account/account.service';
import { Account, AccountType, normalBalanceType } from './account/account.entity';

import { TransactionController } from './transaction/transaction.controller';
import { TransactionService } from './transaction/transaction.service';
import { Transaction, TransactionStatus } from './transaction/transaction.entity';
import { EntryType } from './transaction-line/transaction-line.entity';

import { FinancialStatsController } from './financial-stats/controllers/financial-stats.controller';
import { LedgerService } from './financial-stats/services/ledger.service';
import { TrialBalanceService } from './financial-stats/services/trial-balance.service';
import { IncomeStatementService } from './financial-stats/services/income-statement.service';
import { BalanceSheetService } from './financial-stats/services/balance-sheet.service';

const authGuardMock: CanActivate = {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    req.user = { email: 'api-test@example.com', role: UserRole.ADMIN };
    return true;
  },
};

const rolesGuardMock: CanActivate = {
  canActivate: () => true,
};

function validationPipe(): ValidationPipe {
  return new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: false,
  });
}

describe('AccountController (HTTP)', () => {
  let app: INestApplication;
  let accountService: {
    findAndCount: jest.Mock;
    findById: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    setOpeningBalance: jest.Mock;
    isDescendant: jest.Mock;
  };

  beforeEach(async () => {
    accountService = {
      findAndCount: jest.fn().mockResolvedValue([[], 0]),
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      setOpeningBalance: jest.fn(),
      isDescendant: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [{ provide: AccountService, useValue: accountService }],
    })
      .overrideGuard(AuthGuard)
      .useValue(authGuardMock)
      .overrideGuard(RolesGuard)
      .useValue(rolesGuardMock)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(validationPipe());
    await app.init();
  });

  afterEach(async () => {
    await app?.close();
  });

  it('GET /api/accounting/accounts returns list and pagination headers', async () => {
    const row = {
      id: 1,
      code: 'A-1',
      name: 'Cash',
      type: AccountType.CASH,
      isLeaf: true,
      isSystem: false,
      normalBalance: normalBalanceType.DEBIT,
      openingBalance: 0 as unknown as number,
      openingBalanceLocked: false,
    } as Account;
    accountService.findAndCount.mockResolvedValue([[row], 1]);

    const res = await request(app.getHttpServer()).get('/api/accounting/accounts').expect(200);

    expect(res.body).toHaveLength(1);
    expect(res.body[0].code).toBe('A-1');
    expect(res.headers['x-total-count']).toBe('1');
    expect(res.headers['current-page']).toBeDefined();
  });

  it('GET /api/accounting/accounts/:id returns 404 when missing', async () => {
    accountService.findById.mockResolvedValue(undefined);
    await request(app.getHttpServer()).get('/api/accounting/accounts/99').expect(404);
  });

  it('GET /api/accounting/accounts/:id returns mapped account', async () => {
    accountService.findById.mockResolvedValue({
      id: 2,
      code: 'L-1',
      name: 'Loan',
      type: AccountType.LIABILITY,
      isLeaf: true,
      isSystem: false,
      normalBalance: normalBalanceType.CREDIT,
      openingBalance: 0 as unknown as number,
      openingBalanceLocked: false,
    } as Account);

    const res = await request(app.getHttpServer()).get('/api/accounting/accounts/2').expect(200);
    expect(res.body.id).toBe(2);
    expect(res.body.name).toBe('Loan');
  });

  it('POST /api/accounting/accounts creates account', async () => {
    accountService.save.mockResolvedValue({
      id: 3,
      code: 'CODE-MOCK',
      name: 'New asset',
      type: AccountType.ASSET,
      isLeaf: true,
      isSystem: false,
      normalBalance: normalBalanceType.DEBIT,
      openingBalance: 0 as unknown as number,
      openingBalanceLocked: false,
    } as Account);

    const res = await request(app.getHttpServer())
      .post('/api/accounting/accounts')
      .send({
        name: 'New asset',
        type: AccountType.ASSET,
        normalBalance: normalBalanceType.DEBIT,
      })
      .expect(201);

    expect(res.body.id).toBe(3);
    expect(accountService.save).toHaveBeenCalled();
  });

  it('PUT /api/accounting/accounts/:id/opening-balance sets amount', async () => {
    accountService.setOpeningBalance.mockResolvedValue({
      id: 4,
      code: 'X',
      name: 'Y',
      type: AccountType.ASSET,
      isLeaf: true,
      isSystem: false,
      normalBalance: normalBalanceType.DEBIT,
      openingBalance: 500 as unknown as number,
      openingBalanceLocked: true,
    } as Account);

    const res = await request(app.getHttpServer())
      .put('/api/accounting/accounts/4/opening-balance')
      .send({ amount: 500 })
      .expect(200);

    expect(res.body.openingBalance).toBe(500);
    expect(accountService.setOpeningBalance).toHaveBeenCalledWith(4, 500, 'api-test@example.com');
  });

  it('PUT /api/accounting/accounts/:id rejects self as parent', async () => {
    accountService.findById.mockResolvedValue({
      id: 1,
      name: 'A',
      type: AccountType.ASSET,
      normalBalance: normalBalanceType.DEBIT,
    } as Account);

    await request(app.getHttpServer())
      .put('/api/accounting/accounts/1')
      .send({ parentAccountId: 1 })
      .expect(400);
  });

  it('PUT /api/accounting/accounts/:id rejects circular parent move', async () => {
    accountService.findById.mockImplementation((id: number) => {
      if (id === 1) {
        return Promise.resolve({
          id: 1,
          name: 'Root',
          type: AccountType.ASSET,
          normalBalance: normalBalanceType.DEBIT,
        } as Account);
      }
      if (id === 2) {
        return Promise.resolve({
          id: 2,
          name: 'Child',
          type: AccountType.ASSET,
          normalBalance: normalBalanceType.DEBIT,
        } as Account);
      }
      return Promise.resolve(undefined);
    });
    accountService.isDescendant.mockResolvedValue(true);

    await request(app.getHttpServer())
      .put('/api/accounting/accounts/1')
      .send({ parentAccountId: 2 })
      .expect(400);

    expect(accountService.isDescendant).toHaveBeenCalledWith(2, 1);
  });

  it('PUT /api/accounting/accounts/:id updates when valid', async () => {
    const existing = {
      id: 5,
      name: 'Old',
      type: AccountType.ASSET,
      normalBalance: normalBalanceType.DEBIT,
    } as Account;
    accountService.findById.mockResolvedValue(existing);
    accountService.isDescendant.mockResolvedValue(false);
    accountService.update.mockResolvedValue({ ...existing, name: 'New' } as Account);

    const res = await request(app.getHttpServer())
      .put('/api/accounting/accounts/5')
      .send({ name: 'New' })
      .expect(200);

    expect(res.body.name).toBe('New');
  });

  it('DELETE /api/accounting/accounts/:id delegates to service', async () => {
    accountService.delete.mockResolvedValue(undefined);
    await request(app.getHttpServer()).delete('/api/accounting/accounts/7').expect(200);
    expect(accountService.delete).toHaveBeenCalledWith(7);
  });
});

describe('TransactionController (HTTP)', () => {
  let app: INestApplication;
  let transactionService: {
    findAndCount: jest.Mock;
    findById: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  let accountService: { ensureAccountAcceptsJournalLines: jest.Mock };

  beforeEach(async () => {
    transactionService = {
      findAndCount: jest.fn().mockResolvedValue([[], 0]),
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    accountService = { ensureAccountAcceptsJournalLines: jest.fn().mockResolvedValue(undefined) };

    const moduleRef = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        { provide: TransactionService, useValue: transactionService },
        { provide: AccountService, useValue: accountService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(authGuardMock)
      .overrideGuard(RolesGuard)
      .useValue(rolesGuardMock)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(validationPipe());
    await app.init();
  });

  afterEach(async () => {
    await app?.close();
  });

  it('GET /api/accounting/transactions lists with headers', async () => {
    const tx = {
      id: 1,
      code: 'T-1',
      date: new Date('2025-01-01'),
      description: 'Test',
      status: TransactionStatus.DRAFT,
      transactionLines: [],
    } as Transaction;
    transactionService.findAndCount.mockResolvedValue([[tx], 1]);

    const res = await request(app.getHttpServer()).get('/api/accounting/transactions').expect(200);
    expect(res.body).toHaveLength(1);
    expect(res.headers['x-total-count']).toBe('1');
  });

  it('GET /api/accounting/transactions/:id returns 404 when missing', async () => {
    transactionService.findById.mockResolvedValue(undefined);
    await request(app.getHttpServer()).get('/api/accounting/transactions/404').expect(404);
  });

  it('POST /api/accounting/transactions rejects duplicate account ids on lines', async () => {
    await request(app.getHttpServer())
      .post('/api/accounting/transactions')
      .send({
        date: '2025-01-15',
        description: 'dup',
        status: TransactionStatus.DRAFT,
        transactionLines: [
          { accountId: 1, entryType: EntryType.DEBIT, amount: 10, description: 'd' },
          { accountId: 1, entryType: EntryType.CREDIT, amount: 10, description: 'c' },
        ],
      })
      .expect(400);

    expect(accountService.ensureAccountAcceptsJournalLines).toHaveBeenCalledTimes(2);
    expect(transactionService.save).not.toHaveBeenCalled();
  });

  it('POST /api/accounting/transactions creates when lines are valid', async () => {
    const saved = {
      id: 10,
      code: 'TRN-1',
      date: new Date('2025-02-01'),
      description: 'Balanced',
      status: TransactionStatus.DRAFT,
      transactionLines: [],
    } as Transaction;
    transactionService.save.mockResolvedValue(saved);

    const res = await request(app.getHttpServer())
      .post('/api/accounting/transactions')
      .send({
        date: '2025-02-01',
        description: 'Balanced',
        status: TransactionStatus.DRAFT,
        transactionLines: [
          { accountId: 1, entryType: EntryType.DEBIT, amount: 100, description: 'd' },
          { accountId: 2, entryType: EntryType.CREDIT, amount: 100, description: 'c' },
        ],
      })
      .expect(201);

    expect(res.body.id).toBe(10);
    expect(accountService.ensureAccountAcceptsJournalLines).toHaveBeenCalledTimes(2);
    expect(transactionService.save).toHaveBeenCalled();
  });

  it('PUT /api/accounting/transactions/:id returns 404 when missing', async () => {
    transactionService.findById.mockResolvedValue(undefined);
    await request(app.getHttpServer())
      .put('/api/accounting/transactions/99')
      .send({ description: 'x' })
      .expect(404);
  });

  it('DELETE /api/accounting/transactions/:id returns 404 when missing', async () => {
    transactionService.findById.mockResolvedValue(undefined);
    await request(app.getHttpServer()).delete('/api/accounting/transactions/99').expect(404);
  });

  it('DELETE /api/accounting/transactions/:id removes transaction', async () => {
    transactionService.findById.mockResolvedValue({ id: 3 } as Transaction);
    await request(app.getHttpServer()).delete('/api/accounting/transactions/3').expect(200);
    expect(transactionService.delete).toHaveBeenCalledWith(3);
  });
});

describe('FinancialStatsController (HTTP)', () => {
  let app: INestApplication;
  let ledgerService: { getLedger: jest.Mock };
  let trialBalanceService: { getTrialBalance: jest.Mock };
  let incomeStatementService: { getIncomeStatement: jest.Mock };
  let balanceSheetService: { getBalanceSheet: jest.Mock };

  beforeEach(async () => {
    ledgerService = {
      getLedger: jest.fn().mockResolvedValue({
        account: {
          id: 1,
          code: 'A-1',
          name: 'Cash',
          type: AccountType.CASH,
          normalBalance: normalBalanceType.DEBIT,
        },
        openingBalance: 0,
        lines: [],
        closingBalance: 0,
        periodTotalDebits: 0,
        periodTotalCredits: 0,
        periodClosingBalance: 0,
        total: 0,
      }),
    };
    trialBalanceService = {
      getTrialBalance: jest.fn().mockResolvedValue({
        flat: true,
        lines: [],
        grandTotalDebit: 0,
        grandTotalCredit: 0,
        grandOpeningDebit: 0,
        grandOpeningCredit: 0,
        isBalanced: true,
      }),
    };
    incomeStatementService = {
      getIncomeStatement: jest.fn().mockResolvedValue({
        flat: true,
        revenues: [],
        expenses: [],
        totalRevenue: 0,
        totalExpenses: 0,
        netIncome: 0,
      }),
    };
    balanceSheetService = {
      getBalanceSheet: jest.fn().mockResolvedValue({
        flat: true,
        asOf: '2025-06-30',
        comparePriorYear: false,
        assets: [],
        liabilities: [],
        equity: [],
        totalAssets: 0,
        totalLiabilities: 0,
        totalEquity: 0,
        isBalanced: true,
      }),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [FinancialStatsController],
      providers: [
        { provide: LedgerService, useValue: ledgerService },
        { provide: TrialBalanceService, useValue: trialBalanceService },
        { provide: IncomeStatementService, useValue: incomeStatementService },
        { provide: BalanceSheetService, useValue: balanceSheetService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(authGuardMock)
      .overrideGuard(RolesGuard)
      .useValue(rolesGuardMock)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(validationPipe());
    await app.init();
  });

  afterEach(async () => {
    await app?.close();
  });

  it('GET /api/accounting/reports/ledger forwards query and returns DTO', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/accounting/reports/ledger')
      .query({ accountId: 1, page: 1, pageSize: 10 })
      .expect(200);

    expect(res.body.account.id).toBe(1);
    expect(ledgerService.getLedger).toHaveBeenCalledWith(
      expect.objectContaining({ accountId: 1, page: 1, pageSize: 10 }),
    );
  });

  it('GET /api/accounting/reports/trial-balance passes flat flag', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/accounting/reports/trial-balance')
      .query({ flat: 'true', dateFrom: '2025-01-01', dateTo: '2025-01-31' })
      .expect(200);

    expect(res.body.flat).toBe(true);
    expect(trialBalanceService.getTrialBalance).toHaveBeenCalledWith(
      expect.objectContaining({ flat: true, dateFrom: '2025-01-01', dateTo: '2025-01-31' }),
    );
  });

  it('GET /api/accounting/reports/income-statement returns mapped report', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/accounting/reports/income-statement')
      .query({ flat: true })
      .expect(200);

    expect(res.body.netIncome).toBe(0);
    expect(incomeStatementService.getIncomeStatement).toHaveBeenCalled();
  });

  it('GET /api/accounting/reports/income-statement maps revenueTree when flat=false', async () => {
    incomeStatementService.getIncomeStatement.mockResolvedValueOnce({
      flat: false,
      revenueTree: [
        {
          accountId: 100,
          accountCode: '4000',
          accountName: 'Revenue head',
          accountType: AccountType.REVENUE,
          amount: 90000,
          children: [
            {
              accountId: 10,
              accountCode: '4100',
              accountName: 'Sales',
              accountType: AccountType.REVENUE,
              amount: 90000,
            },
          ],
        },
      ],
      expenseTree: [],
      totalRevenue: 90000,
      totalExpenses: 0,
      netIncome: 90000,
    });

    const res = await request(app.getHttpServer())
      .get('/api/accounting/reports/income-statement')
      .query({ flat: false })
      .expect(200);

    expect(res.body.flat).toBe(false);
    expect(res.body.revenueTree).toHaveLength(1);
    expect(res.body.revenueTree[0].accountId).toBe(100);
    expect(res.body.revenueTree[0].amount).toBe(90000);
    expect(res.body.revenueTree[0].children).toHaveLength(1);
    expect(res.body.revenueTree[0].children[0].accountId).toBe(10);
    expect(res.body.revenues).toBeUndefined();
    expect(res.body.netIncome).toBe(90000);
    expect(incomeStatementService.getIncomeStatement).toHaveBeenCalledWith(
      expect.objectContaining({ flat: false }),
    );
  });

  it('GET /api/accounting/reports/balance-sheet passes asOf and flat', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/accounting/reports/balance-sheet')
      .query({ asOf: '2025-06-30', flat: true })
      .expect(200);

    expect(res.body.asOf).toBe('2025-06-30');
    expect(balanceSheetService.getBalanceSheet).toHaveBeenCalledWith(
      expect.objectContaining({ asOf: '2025-06-30', flat: true }),
    );
  });
});
