import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Account, AccountType, normalBalanceType } from '../account/account.entity';
import { TransactionLine, EntryType } from '../transaction-line/transaction-line.entity';
import { TrialBalanceService } from './services/trial-balance.service';
import { IncomeStatementService } from './services/income-statement.service';
import { BalanceSheetService, priorYearSameCalendarDay } from './services/balance-sheet.service';
import { LedgerService } from './services/ledger.service';

/** Chainable TypeORM query builder mock (subset used by financial report services). */
function createChainMock(opts: {
  getRawMany?: jest.Mock;
  getRawOne?: jest.Mock;
  getMany?: jest.Mock;
}) {
  const chain: Record<string, jest.Mock> = {
    select: jest.fn(),
    addSelect: jest.fn(),
    innerJoin: jest.fn(),
    innerJoinAndSelect: jest.fn(),
    where: jest.fn(),
    andWhere: jest.fn(),
    groupBy: jest.fn(),
    addGroupBy: jest.fn(),
    orderBy: jest.fn(),
    addOrderBy: jest.fn(),
    getRawMany: opts.getRawMany ?? jest.fn().mockResolvedValue([]),
    getRawOne: opts.getRawOne ?? jest.fn().mockResolvedValue(null),
    getMany: opts.getMany ?? jest.fn().mockResolvedValue([]),
  };
  for (const k of Object.keys(chain)) {
    if (k !== 'getRawMany' && k !== 'getRawOne' && k !== 'getMany') {
      chain[k].mockReturnValue(chain);
    }
  }
  return chain;
}

function mockAccountRepoFind(accounts: Partial<Account>[]) {
  return jest
    .fn()
    .mockResolvedValue([...accounts].sort((a, b) => String(a.code).localeCompare(String(b.code))));
}

describe('priorYearSameCalendarDay', () => {
  it('subtracts one calendar year', () => {
    expect(priorYearSameCalendarDay('2025-06-30')).toBe('2024-06-30');
  });
});

describe('TrialBalanceService', () => {
  let service: TrialBalanceService;
  let tlRepo: { createQueryBuilder: jest.Mock };
  let accountRepo: { createQueryBuilder: jest.Mock; find: jest.Mock };

  beforeEach(async () => {
    tlRepo = { createQueryBuilder: jest.fn() };
    accountRepo = {
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      }),
      find: jest.fn().mockResolvedValue([]),
    };
    const moduleRef = await Test.createTestingModule({
      providers: [
        TrialBalanceService,
        { provide: getRepositoryToken(TransactionLine), useValue: tlRepo },
        { provide: getRepositoryToken(Account), useValue: accountRepo },
      ],
    }).compile();
    service = moduleRef.get(TrialBalanceService);
  });

  it('aggregates debits/credits per account and marks balanced when ΣD = ΣC', async () => {
    const chain = createChainMock({
      getRawMany: jest.fn().mockResolvedValue([
        {
          accountId: '1',
          accountCode: 'A-1',
          accountName: 'Cash',
          accountType: AccountType.CASH,
          normalBalance: normalBalanceType.DEBIT,
          totalDebit: '10000',
          totalCredit: '3000',
        },
        {
          accountId: '2',
          accountCode: 'A-2',
          accountName: 'Equity',
          accountType: AccountType.EQUITY,
          normalBalance: normalBalanceType.CREDIT,
          totalDebit: '0',
          totalCredit: '7000',
        },
      ]),
    });
    tlRepo.createQueryBuilder.mockReturnValue(chain);
    accountRepo.find = mockAccountRepoFind([
      {
        id: 1,
        code: 'A-1',
        name: 'Cash',
        type: AccountType.CASH,
        normalBalance: normalBalanceType.DEBIT,
        openingBalance: 0,
      },
      {
        id: 2,
        code: 'A-2',
        name: 'Equity',
        type: AccountType.EQUITY,
        normalBalance: normalBalanceType.CREDIT,
        openingBalance: 0,
      },
    ]);

    const report = await service.getTrialBalance({ flat: true });

    expect(report.lines!).toHaveLength(2);
    expect(report.lines![0].balance).toBe(7000);
    expect(report.lines![0].openingBalance).toBe(0);
    expect(report.lines![0].closingBalance).toBe(7000);
    expect(report.lines![1].balance).toBe(7000);
    expect(report.grandTotalDebit).toBe(10000);
    expect(report.grandTotalCredit).toBe(10000);
    expect(report.grandOpeningDebit).toBe(0);
    expect(report.grandOpeningCredit).toBe(0);
    expect(report.isBalanced).toBe(true);
  });

  it('isBalanced is false when totals differ', async () => {
    const chain = createChainMock({
      getRawMany: jest.fn().mockResolvedValue([
        {
          accountId: '1',
          accountCode: 'A-1',
          accountName: 'X',
          accountType: AccountType.ASSET,
          normalBalance: normalBalanceType.DEBIT,
          totalDebit: '100',
          totalCredit: '0',
        },
      ]),
    });
    tlRepo.createQueryBuilder.mockReturnValue(chain);
    accountRepo.find = mockAccountRepoFind([
      {
        id: 1,
        code: 'A-1',
        name: 'X',
        type: AccountType.ASSET,
        normalBalance: normalBalanceType.DEBIT,
        openingBalance: 0,
      },
    ]);

    const report = await service.getTrialBalance({ flat: true });
    expect(report.grandTotalDebit).toBe(100);
    expect(report.grandTotalCredit).toBe(0);
    expect(report.isBalanced).toBe(false);
  });

  it('returns nested tree with rolled-up parent when flat=false', async () => {
    const periodChain = createChainMock({
      getRawMany: jest.fn().mockResolvedValue([
        {
          accountId: '2',
          accountCode: 'C-1',
          accountName: 'Leaf A',
          accountType: AccountType.ASSET,
          normalBalance: normalBalanceType.DEBIT,
          totalDebit: '400',
          totalCredit: '0',
        },
        {
          accountId: '3',
          accountCode: 'C-2',
          accountName: 'Leaf B',
          accountType: AccountType.ASSET,
          normalBalance: normalBalanceType.DEBIT,
          totalDebit: '100',
          totalCredit: '0',
        },
      ]),
    });
    tlRepo.createQueryBuilder.mockReturnValue(periodChain);

    const parentStub = { id: 1 } as Account;
    accountRepo.find = jest.fn().mockResolvedValue([
      {
        id: 1,
        code: 'P',
        name: 'Parent',
        type: AccountType.ASSET,
        normalBalance: normalBalanceType.DEBIT,
        openingBalance: 0,
        parentAccount: undefined,
      } as Account,
      {
        id: 2,
        code: 'C-1',
        name: 'Leaf A',
        type: AccountType.ASSET,
        normalBalance: normalBalanceType.DEBIT,
        openingBalance: 0,
        parentAccount: parentStub,
      } as Account,
      {
        id: 3,
        code: 'C-2',
        name: 'Leaf B',
        type: AccountType.ASSET,
        normalBalance: normalBalanceType.DEBIT,
        openingBalance: 0,
        parentAccount: parentStub,
      } as Account,
    ]);

    const report = await service.getTrialBalance({ flat: false });
    expect(report.flat).toBe(false);
    expect(report.tree).toHaveLength(1);
    expect(report.tree![0].accountId).toBe(1);
    expect(report.tree![0].totalDebit).toBe(500);
    expect(report.tree![0].children).toHaveLength(2);
    expect(report.lines).toBeUndefined();
  });
});

describe('IncomeStatementService', () => {
  let service: IncomeStatementService;
  let tlRepo: { createQueryBuilder: jest.Mock };
  const accountRepo = { find: jest.fn().mockResolvedValue([]) };

  beforeEach(async () => {
    accountRepo.find.mockReset();
    accountRepo.find.mockResolvedValue([]);
    tlRepo = { createQueryBuilder: jest.fn() };
    const moduleRef = await Test.createTestingModule({
      providers: [
        IncomeStatementService,
        { provide: getRepositoryToken(TransactionLine), useValue: tlRepo },
        { provide: getRepositoryToken(Account), useValue: accountRepo },
      ],
    }).compile();
    service = moduleRef.get(IncomeStatementService);
  });

  it('computes netIncome = totalRevenue − totalExpenses', async () => {
    const chain = createChainMock({
      getRawMany: jest.fn().mockResolvedValue([
        {
          accountId: '10',
          accountCode: 'R-1',
          accountName: 'Sales',
          accountType: AccountType.REVENUE,
          normalBalance: normalBalanceType.CREDIT,
          totalDebit: '0',
          totalCredit: '50000',
        },
        {
          accountId: '11',
          accountCode: 'E-1',
          accountName: 'Rent',
          accountType: AccountType.EXPENSE,
          normalBalance: normalBalanceType.DEBIT,
          totalDebit: '12000',
          totalCredit: '0',
        },
      ]),
    });
    tlRepo.createQueryBuilder.mockReturnValue(chain);

    const report = await service.getIncomeStatement({ flat: true });

    expect(report.totalRevenue).toBe(50000);
    expect(report.totalExpenses).toBe(12000);
    expect(report.netIncome).toBe(38000);
    expect(report.revenues).toHaveLength(1);
    expect(report.expenses).toHaveLength(1);
  });

  it('returns revenueTree with rolled-up parent when flat=false', async () => {
    const chain = createChainMock({
      getRawMany: jest.fn().mockResolvedValue([
        {
          accountId: '10',
          accountCode: '4100',
          accountName: 'Sales',
          accountType: AccountType.REVENUE,
          normalBalance: normalBalanceType.CREDIT,
          totalDebit: '0',
          totalCredit: '50000',
        },
      ]),
    });
    tlRepo.createQueryBuilder.mockReturnValue(chain);

    const parentStub = { id: 100 } as Account;
    accountRepo.find.mockResolvedValue([
      {
        id: 100,
        code: '4000',
        name: 'Revenue group',
        type: AccountType.REVENUE,
        normalBalance: normalBalanceType.CREDIT,
        parentAccount: undefined,
      } as Account,
      {
        id: 10,
        code: '4100',
        name: 'Sales',
        type: AccountType.REVENUE,
        normalBalance: normalBalanceType.CREDIT,
        parentAccount: parentStub,
      } as Account,
    ]);

    const report = await service.getIncomeStatement({ flat: false });

    expect(report.flat).toBe(false);
    expect(report.revenueTree).toHaveLength(1);
    expect(report.revenueTree![0].accountId).toBe(100);
    expect(report.revenueTree![0].amount).toBe(50000);
    expect(report.revenueTree![0].children).toHaveLength(1);
    expect(report.revenueTree![0].children![0].accountId).toBe(10);
    expect(report.revenueTree![0].children![0].amount).toBe(50000);
    expect(report.revenues).toBeUndefined();
    expect(report.totalRevenue).toBe(50000);
  });

  it('returns expenseTree with rolled-up parent when flat=false', async () => {
    const chain = createChainMock({
      getRawMany: jest.fn().mockResolvedValue([
        {
          accountId: '30',
          accountCode: '6100',
          accountName: 'Utilities',
          accountType: AccountType.EXPENSE,
          normalBalance: normalBalanceType.DEBIT,
          totalDebit: '12000',
          totalCredit: '0',
        },
      ]),
    });
    tlRepo.createQueryBuilder.mockReturnValue(chain);

    const parentStub = { id: 200 } as Account;
    accountRepo.find.mockResolvedValue([
      {
        id: 200,
        code: '6000',
        name: 'Operating expenses',
        type: AccountType.EXPENSE,
        normalBalance: normalBalanceType.DEBIT,
        parentAccount: undefined,
      } as Account,
      {
        id: 30,
        code: '6100',
        name: 'Utilities',
        type: AccountType.EXPENSE,
        normalBalance: normalBalanceType.DEBIT,
        parentAccount: parentStub,
      } as Account,
    ]);

    const report = await service.getIncomeStatement({ flat: false });

    expect(report.expenseTree).toHaveLength(1);
    expect(report.expenseTree![0].accountId).toBe(200);
    expect(report.expenseTree![0].amount).toBe(12000);
    expect(report.expenseTree![0].children).toHaveLength(1);
    expect(report.expenseTree![0].children![0].amount).toBe(12000);
    expect(report.totalExpenses).toBe(12000);
    expect(report.netIncome).toBe(-12000);
  });

  it('rolls up revenue parent from two posting children when flat=false', async () => {
    const chain = createChainMock({
      getRawMany: jest.fn().mockResolvedValue([
        {
          accountId: '11',
          accountCode: '4110',
          accountName: 'Service A',
          accountType: AccountType.REVENUE,
          normalBalance: normalBalanceType.CREDIT,
          totalDebit: '0',
          totalCredit: '20000',
        },
        {
          accountId: '12',
          accountCode: '4120',
          accountName: 'Service B',
          accountType: AccountType.REVENUE,
          normalBalance: normalBalanceType.CREDIT,
          totalDebit: '0',
          totalCredit: '30000',
        },
      ]),
    });
    tlRepo.createQueryBuilder.mockReturnValue(chain);

    const parentStub = { id: 100 } as Account;
    accountRepo.find.mockResolvedValue([
      {
        id: 100,
        code: '4000',
        name: 'Revenue head',
        type: AccountType.REVENUE,
        normalBalance: normalBalanceType.CREDIT,
        parentAccount: undefined,
      } as Account,
      {
        id: 11,
        code: '4110',
        name: 'Service A',
        type: AccountType.REVENUE,
        normalBalance: normalBalanceType.CREDIT,
        parentAccount: parentStub,
      } as Account,
      {
        id: 12,
        code: '4120',
        name: 'Service B',
        type: AccountType.REVENUE,
        normalBalance: normalBalanceType.CREDIT,
        parentAccount: parentStub,
      } as Account,
    ]);

    const report = await service.getIncomeStatement({ flat: false });

    expect(report.revenueTree).toHaveLength(1);
    expect(report.revenueTree![0].amount).toBe(50000);
    expect(report.revenueTree![0].children).toHaveLength(2);
    expect(report.revenueTree![0].children!.map((c) => c.amount).sort((a, b) => a - b)).toEqual([
      20000, 30000,
    ]);
    expect(report.totalRevenue).toBe(50000);
  });

  it('returns empty revenueTree and expenseTree when no P&L postings and flat=false', async () => {
    const chain = createChainMock({
      getRawMany: jest.fn().mockResolvedValue([]),
    });
    tlRepo.createQueryBuilder.mockReturnValue(chain);

    const report = await service.getIncomeStatement({ flat: false });

    expect(report.revenueTree).toEqual([]);
    expect(report.expenseTree).toEqual([]);
    expect(report.totalRevenue).toBe(0);
    expect(report.totalExpenses).toBe(0);
    expect(report.netIncome).toBe(0);
  });

  it('revenueTree root amounts sum to totalRevenue for independent roots', async () => {
    const chain = createChainMock({
      getRawMany: jest.fn().mockResolvedValue([
        {
          accountId: '50',
          accountCode: '5000',
          accountName: 'Other income',
          accountType: AccountType.REVENUE,
          normalBalance: normalBalanceType.CREDIT,
          totalDebit: '0',
          totalCredit: '1000',
        },
        {
          accountId: '10',
          accountCode: '4100',
          accountName: 'Sales',
          accountType: AccountType.REVENUE,
          normalBalance: normalBalanceType.CREDIT,
          totalDebit: '0',
          totalCredit: '4000',
        },
      ]),
    });
    tlRepo.createQueryBuilder.mockReturnValue(chain);

    accountRepo.find.mockResolvedValue([
      {
        id: 10,
        code: '4100',
        name: 'Sales',
        type: AccountType.REVENUE,
        normalBalance: normalBalanceType.CREDIT,
        parentAccount: undefined,
      } as Account,
      {
        id: 50,
        code: '5000',
        name: 'Other income',
        type: AccountType.REVENUE,
        normalBalance: normalBalanceType.CREDIT,
        parentAccount: undefined,
      } as Account,
    ]);

    const report = await service.getIncomeStatement({ flat: false });
    const sumRoots = report.revenueTree!.reduce((s, n) => s + n.amount, 0);
    expect(sumRoots).toBe(report.totalRevenue);
    expect(report.totalRevenue).toBe(5000);
  });
});

describe('BalanceSheetService', () => {
  let service: BalanceSheetService;
  let tlRepo: { createQueryBuilder: jest.Mock };
  let accountRepo: { createQueryBuilder: jest.Mock; find: jest.Mock };

  beforeEach(async () => {
    tlRepo = { createQueryBuilder: jest.fn() };
    accountRepo = {
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      }),
      find: jest.fn().mockResolvedValue([]),
    };
    const moduleRef = await Test.createTestingModule({
      providers: [
        BalanceSheetService,
        { provide: getRepositoryToken(TransactionLine), useValue: tlRepo },
        { provide: getRepositoryToken(Account), useValue: accountRepo },
      ],
    }).compile();
    service = moduleRef.get(BalanceSheetService);
  });

  it('builds balances from postings + stored opening; injects net income to equity', async () => {
    const mainChain = createChainMock({
      getRawMany: jest.fn().mockResolvedValue([
        {
          accountId: '1',
          accountCode: 'A-1',
          accountName: 'Cash',
          accountType: AccountType.CASH,
          normalBalance: normalBalanceType.DEBIT,
          openingBalance: '0',
          totalDebit: '20000',
          totalCredit: '0',
        },
        {
          accountId: '2',
          accountCode: 'L-1',
          accountName: 'Loan',
          accountType: AccountType.LIABILITY,
          normalBalance: normalBalanceType.CREDIT,
          openingBalance: '0',
          totalDebit: '0',
          totalCredit: '5000',
        },
        {
          accountId: '3',
          accountCode: 'Q-1',
          accountName: 'Capital',
          accountType: AccountType.EQUITY,
          normalBalance: normalBalanceType.CREDIT,
          openingBalance: '0',
          totalDebit: '0',
          totalCredit: '10000',
        },
      ]),
    });
    const incomeChain = createChainMock({
      getRawOne: jest.fn().mockResolvedValue({
        totalRevenue: '8000',
        totalExpenses: '3000',
      }),
    });

    let tlCall = 0;
    tlRepo.createQueryBuilder.mockImplementation(() => {
      tlCall += 1;
      return tlCall === 1 ? mainChain : incomeChain;
    });

    const report = await service.getBalanceSheet({ asOf: '2025-06-30', flat: true });

    expect(report.asOf).toBe('2025-06-30');
    expect(report.comparePriorYear).toBe(false);
    expect(report.totalAssets).toBe(20000);
    expect(report.totalLiabilities).toBe(5000);
    expect(report.equity!.some((e) => e.accountCode === 'NET-INCOME')).toBe(true);
    expect(report.totalEquity).toBe(10000 + 5000);
    expect(report.isBalanced).toBe(true);
  });

  it('returns assetTree with rolled-up parent when flat=false', async () => {
    const mainChain = createChainMock({
      getRawMany: jest.fn().mockResolvedValue([
        {
          accountId: '1',
          accountCode: '1110',
          accountName: 'Cash',
          accountType: AccountType.CASH,
          normalBalance: normalBalanceType.DEBIT,
          openingBalance: '0',
          totalDebit: '20000',
          totalCredit: '0',
        },
      ]),
    });
    const incomeChain = createChainMock({
      getRawOne: jest.fn().mockResolvedValue({
        totalRevenue: '8000',
        totalExpenses: '3000',
      }),
    });

    let tlCall = 0;
    tlRepo.createQueryBuilder.mockImplementation(() => {
      tlCall += 1;
      return tlCall === 1 ? mainChain : incomeChain;
    });

    const parentStub = { id: 100 } as Account;
    accountRepo.find.mockResolvedValue([
      {
        id: 100,
        code: '1100',
        name: 'Current assets',
        type: AccountType.ASSET,
        normalBalance: normalBalanceType.DEBIT,
        parentAccount: undefined,
      } as Account,
      {
        id: 1,
        code: '1110',
        name: 'Cash',
        type: AccountType.CASH,
        normalBalance: normalBalanceType.DEBIT,
        openingBalance: 0,
        parentAccount: parentStub,
      } as Account,
    ]);

    const report = await service.getBalanceSheet({ asOf: '2025-06-30', flat: false });

    expect(report.flat).toBe(false);
    expect(report.assets).toBeUndefined();
    expect(report.assetTree).toHaveLength(1);
    expect(report.assetTree![0].accountId).toBe(100);
    expect(report.assetTree![0].balance).toBe(20000);
    expect(report.assetTree![0].children).toHaveLength(1);
    expect(report.assetTree![0].children![0].accountId).toBe(1);
    expect(report.assetTree![0].children![0].balance).toBe(20000);
    expect(report.totalAssets).toBe(20000);
  });
});

describe('LedgerService', () => {
  let service: LedgerService;
  let accountRepo: { findOne: jest.Mock };
  let tlRepo: { createQueryBuilder: jest.Mock };

  beforeEach(async () => {
    accountRepo = { findOne: jest.fn() };
    tlRepo = { createQueryBuilder: jest.fn() };
    const moduleRef = await Test.createTestingModule({
      providers: [
        LedgerService,
        { provide: getRepositoryToken(Account), useValue: accountRepo },
        { provide: getRepositoryToken(TransactionLine), useValue: tlRepo },
      ],
    }).compile();
    service = moduleRef.get(LedgerService);
  });

  it('returns stored opening + prior postings + running balances', async () => {
    const acc = {
      id: 5,
      code: 'A-5',
      name: 'Petty cash',
      type: AccountType.CASH,
      normalBalance: normalBalanceType.DEBIT,
      openingBalance: 500,
    } as Account;
    accountRepo.findOne.mockResolvedValue(acc);

    const openingChain = createChainMock({
      getRawOne: jest.fn().mockResolvedValue({ totalDebit: '1000', totalCredit: '200' }),
    });
    const linesChain = createChainMock({
      getMany: jest.fn().mockResolvedValue([
        {
          id: 1,
          entryType: EntryType.DEBIT,
          amount: 300,
          description: 'Top-up',
          transaction: {
            id: 10,
            code: 'T-1',
            date: new Date('2025-01-15'),
            description: 'Bank transfer',
          },
        },
        {
          id: 2,
          entryType: EntryType.CREDIT,
          amount: 100,
          description: 'Supplies',
          transaction: {
            id: 11,
            code: 'T-2',
            date: new Date('2025-01-20'),
            description: 'Office',
          },
        },
      ]),
    });

    let qbCall = 0;
    tlRepo.createQueryBuilder.mockImplementation(() => {
      qbCall += 1;
      return qbCall === 1 ? openingChain : linesChain;
    });

    const report = await service.getLedger({
      accountId: 5,
      dateFrom: '2025-01-01',
      dateTo: '2025-01-31',
      page: 1,
      pageSize: 10,
    });

    expect(report.account.id).toBe(5);
    expect(report.openingBalance).toBe(1300); // 500 stored + (1000-200) prior postings
    expect(report.periodTotalDebits).toBe(300);
    expect(report.periodTotalCredits).toBe(100);
    expect(report.periodClosingBalance).toBe(1500); // 1300 + 300 - 100
    expect(report.lines).toHaveLength(2);
    expect(report.lines[0].balance).toBe(1600);
    expect(report.lines[1].balance).toBe(1500);
    expect(report.total).toBe(2);
  });

  it('when dateFrom omitted, opening is stored opening only', async () => {
    accountRepo.findOne.mockResolvedValue({
      id: 1,
      code: 'X',
      name: 'X',
      type: AccountType.ASSET,
      normalBalance: normalBalanceType.DEBIT,
      openingBalance: 250,
    });

    const linesChain = createChainMock({
      getMany: jest.fn().mockResolvedValue([]),
    });
    tlRepo.createQueryBuilder.mockReturnValue(linesChain);

    const report = await service.getLedger({ accountId: 1, page: 1, pageSize: 5 });

    expect(report.openingBalance).toBe(250);
    expect(tlRepo.createQueryBuilder).toHaveBeenCalledTimes(1);
  });
});
