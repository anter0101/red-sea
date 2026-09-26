import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';

import { AccountService } from './account/account.service';
import { Account, AccountType } from './account/account.entity';
import { TransactionService } from './transaction/transaction.service';
import { Transaction, TransactionStatus } from './transaction/transaction.entity';
import { TransactionLineService } from './transaction-line/transaction-line.service';
import { TransactionLine, EntryType } from './transaction-line/transaction-line.entity';
import { AccountService } from './account/account.service';
import { FinancialStatsModule } from './financial-stats/financial-stats.module';

describe('AccountService (chart of accounts rules)', () => {
  let service: AccountService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AccountService,
        { provide: getRepositoryToken(Account), useValue: {} },
        {
          provide: getRepositoryToken(TransactionLine),
          useValue: {
            count: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue({
              innerJoin: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getCount: jest.fn().mockResolvedValue(0),
            }),
          },
        },
      ],
    }).compile();
    service = moduleRef.get(AccountService);
  });

  describe('assertChildTypeAllowedUnderParent', () => {
    it('allows same type as parent', () => {
      expect(() =>
        service.assertChildTypeAllowedUnderParent(AccountType.REVENUE, AccountType.REVENUE),
      ).not.toThrow();
    });

    it('allows CASH under ASSET', () => {
      expect(() =>
        service.assertChildTypeAllowedUnderParent(AccountType.ASSET, AccountType.CASH),
      ).not.toThrow();
    });

    it('rejects LIABILITY under ASSET', () => {
      expect(() =>
        service.assertChildTypeAllowedUnderParent(AccountType.ASSET, AccountType.LIABILITY),
      ).toThrow(BadRequestException);
    });

    it('rejects CASH under LIABILITY', () => {
      expect(() =>
        service.assertChildTypeAllowedUnderParent(AccountType.LIABILITY, AccountType.CASH),
      ).toThrow(BadRequestException);
    });
  });
});

describe('TransactionService (posting rules)', () => {
  let service: TransactionService;
  let mockRepo: {
    findOne: jest.Mock;
    save: jest.Mock;
    delete: jest.Mock;
    find: jest.Mock;
    findAndCount: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let accountServiceMock: { lockOpeningBalancesAfterJournalActivity: jest.Mock };

  beforeEach(async () => {
    accountServiceMock = {
      lockOpeningBalancesAfterJournalActivity: jest.fn().mockResolvedValue(undefined),
    };
    mockRepo = {
      findOne: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockImplementation((t: Transaction) => Promise.resolve(t)),
      delete: jest.fn(),
      find: jest.fn(),
      findAndCount: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ latestId: 0 }),
      }),
    };
    const moduleRef = await Test.createTestingModule({
      providers: [
        TransactionService,
        { provide: getRepositoryToken(Transaction), useValue: mockRepo },
        { provide: AccountService, useValue: accountServiceMock },
      ],
    }).compile();
    service = moduleRef.get(TransactionService);
  });

  const balancedLines = (): TransactionLine[] => [
    { entryType: EntryType.DEBIT, amount: 100 } as TransactionLine,
    { entryType: EntryType.CREDIT, amount: 100 } as TransactionLine,
  ];

  it('update rejects when persisted transaction is POSTED', async () => {
    mockRepo.findOne.mockImplementation((opts: { where?: { id?: number } }) => {
      if (opts?.where && 'id' in opts.where && opts.where.id === 1) {
        return Promise.resolve({ id: 1, status: TransactionStatus.POSTED });
      }
      return Promise.resolve(null);
    });
    const tx = {
      id: 1,
      status: TransactionStatus.DRAFT,
      transactionLines: balancedLines(),
    } as Transaction;
    await expect(service.update(tx)).rejects.toThrow(
      /Cannot modify transaction with status POSTED/,
    );
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('update rejects when persisted transaction is CANCELLED', async () => {
    mockRepo.findOne.mockImplementation((opts: { where?: { id?: number } }) => {
      if (opts?.where && 'id' in opts.where && opts.where.id === 2) {
        return Promise.resolve({ id: 2, status: TransactionStatus.CANCELLED });
      }
      return Promise.resolve(null);
    });
    const tx = {
      id: 2,
      status: TransactionStatus.DRAFT,
      transactionLines: balancedLines(),
    } as Transaction;
    await expect(service.update(tx)).rejects.toThrow(
      /Cannot modify transaction with status CANCELLED/,
    );
  });

  it('save rejects with fewer than two lines', async () => {
    const tx = {
      id: undefined,
      transactionLines: [{ entryType: EntryType.DEBIT, amount: 50 } as TransactionLine],
    } as unknown as Transaction;
    await expect(service.save(tx)).rejects.toThrow(/at least two transaction lines/);
  });

  it('save rejects when debits do not equal credits', async () => {
    const tx = {
      transactionLines: [
        { entryType: EntryType.DEBIT, amount: 100 } as TransactionLine,
        { entryType: EntryType.CREDIT, amount: 50 } as TransactionLine,
      ],
    } as Transaction;
    await expect(service.save(tx)).rejects.toThrow(/not balanced/);
  });
});

describe('TransactionLineService', () => {
  let service: TransactionLineService;
  let mockRepo: { findOne: jest.Mock; save: jest.Mock };

  beforeEach(async () => {
    mockRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
    };
    const moduleRef = await Test.createTestingModule({
      providers: [
        TransactionLineService,
        { provide: getRepositoryToken(TransactionLine), useValue: mockRepo },
      ],
    }).compile();
    service = moduleRef.get(TransactionLineService);
  });

  it('findById returns undefined when not found', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    await expect(service.findById(999)).resolves.toBeUndefined();
  });
});

describe('FinancialStatsModule', () => {
  it('is loadable (reports wiring)', () => {
    expect(FinancialStatsModule).toBeDefined();
    expect(FinancialStatsModule.name).toBe('FinancialStatsModule');
  });
});
