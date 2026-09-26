import { Test } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';

jest.mock('src/core/utils/generator', () => ({
  generateUniqueCode: jest.fn().mockResolvedValue('CODE-MOCK-1'),
}));

import { AccountService } from './account/account.service';
import { Account, AccountType, normalBalanceType } from './account/account.entity';
import { QueryAccountDTO } from './account/dtos/query-account.dto';
import { TransactionService } from './transaction/transaction.service';
import { Transaction, TransactionStatus } from './transaction/transaction.entity';
import { TransactionLineService } from './transaction-line/transaction-line.service';
import { TransactionLine, EntryType } from './transaction-line/transaction-line.entity';

function createAccountRepoMock() {
  return {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
}

function createTransactionLineRepoMock() {
  return {
    count: jest.fn().mockResolvedValue(0),
    createQueryBuilder: jest.fn().mockReturnValue({
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(0),
    }),
  };
}

describe('AccountService (persistence & rules)', () => {
  let service: AccountService;
  let mockRepo: ReturnType<typeof createAccountRepoMock>;
  let mockTlRepo: ReturnType<typeof createTransactionLineRepoMock>;

  beforeEach(async () => {
    mockRepo = createAccountRepoMock();
    mockRepo.find.mockResolvedValue([]);
    mockTlRepo = createTransactionLineRepoMock();
    const moduleRef = await Test.createTestingModule({
      providers: [
        AccountService,
        { provide: getRepositoryToken(Account), useValue: mockRepo },
        { provide: getRepositoryToken(TransactionLine), useValue: mockTlRepo },
      ],
    }).compile();
    service = moduleRef.get(AccountService);
  });

  it('findById returns undefined when not found', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    await expect(service.findById(1)).resolves.toBeUndefined();
  });

  it('findById returns account when found', async () => {
    const acc = { id: 1, code: 'A-1' } as Account;
    mockRepo.findOne.mockResolvedValue(acc);
    await expect(service.findById(1)).resolves.toBe(acc);
  });

  it('save rejects root account missing type or normalBalance', async () => {
    await expect(
      service.save({ name: 'Root', normalBalance: normalBalanceType.DEBIT } as Account),
    ).rejects.toThrow(/Root accounts must include both type and normalBalance/);
  });

  it('save rejects when parent is missing', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    await expect(
      service.save({
        name: 'Child',
        type: AccountType.ASSET,
        parentAccount: { id: 999 } as Account,
      } as Account),
    ).rejects.toThrow(NotFoundException);
  });

  it('save rejects child normalBalance conflicting with parent', async () => {
    mockRepo.findOne.mockResolvedValue({
      id: 1,
      type: AccountType.ASSET,
      normalBalance: normalBalanceType.DEBIT,
    } as Account);
    await expect(
      service.save({
        name: 'Child',
        type: AccountType.ASSET,
        normalBalance: normalBalanceType.CREDIT,
        parentAccount: { id: 1 } as Account,
      } as Account),
    ).rejects.toThrow(/inherit normalBalance/);
  });

  it('save persists root and assigns generated code when omitted', async () => {
    mockRepo.save.mockImplementation((a: Account) => Promise.resolve({ ...a, id: 42 }));
    const input = {
      name: 'Assets',
      type: AccountType.ASSET,
      normalBalance: normalBalanceType.DEBIT,
      isLeaf: true,
    } as Account;
    const out = await service.save(input);
    expect(out.id).toBe(42);
    expect(out.code).toBe('CODE-MOCK-1');
    expect(mockRepo.save).toHaveBeenCalled();
  });

  it('save rejects root when type and normalBalance disagree (A2)', async () => {
    await expect(
      service.save({
        name: 'Bad equity',
        type: AccountType.EQUITY,
        normalBalance: normalBalanceType.DEBIT,
        isLeaf: true,
      } as Account),
    ).rejects.toThrow(/normalBalance must be CREDIT/);
  });

  it('save child marks parent as non-leaf', async () => {
    mockRepo.findOne.mockResolvedValue({
      id: 10,
      type: AccountType.ASSET,
      normalBalance: normalBalanceType.DEBIT,
    } as Account);
    mockRepo.save.mockImplementation((a: Account) => Promise.resolve({ ...a, id: 11 }));
    await service.save({
      name: 'Cash',
      type: AccountType.CASH,
      parentAccount: { id: 10 } as Account,
      isLeaf: true,
    } as Account);
    expect(mockRepo.update).toHaveBeenCalledWith(10, { isLeaf: false });
  });

  it('save rejects non-zero opening balance under parent when branch has posted transactions (N2)', async () => {
    mockRepo.findOne.mockResolvedValue({
      id: 10,
      type: AccountType.ASSET,
      normalBalance: normalBalanceType.DEBIT,
    } as Account);
    mockTlRepo.createQueryBuilder.mockReturnValue({
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(1),
    });
    await expect(
      service.save({
        name: 'Late leaf',
        type: AccountType.CASH,
        openingBalance: 100 as unknown as number,
        parentAccount: { id: 10 } as Account,
        isLeaf: true,
      } as Account),
    ).rejects.toThrow(/posted transactions/);
  });

  it('hasChildAccounts reflects count', async () => {
    mockRepo.count.mockResolvedValue(2);
    await expect(service.hasChildAccounts(5)).resolves.toBe(true);
    mockRepo.count.mockResolvedValue(0);
    await expect(service.hasChildAccounts(5)).resolves.toBe(false);
  });

  it('isLeafAccount is inverse of hasChildAccounts', async () => {
    mockRepo.count.mockResolvedValue(1);
    await expect(service.isLeafAccount(1)).resolves.toBe(false);
    mockRepo.count.mockResolvedValue(0);
    await expect(service.isLeafAccount(1)).resolves.toBe(true);
  });

  it('ensureAccountAcceptsJournalLines rejects non-leaf flag', async () => {
    mockRepo.findOne.mockResolvedValue({
      id: 1,
      isLeaf: false,
    } as Account);
    mockRepo.count.mockResolvedValue(0);
    await expect(service.ensureAccountAcceptsJournalLines(1)).rejects.toThrow(/not a leaf account/);
  });

  it('ensureAccountAcceptsJournalLines rejects when children exist', async () => {
    mockRepo.findOne.mockResolvedValue({
      id: 1,
      isLeaf: true,
    } as Account);
    mockRepo.count.mockResolvedValue(1);
    await expect(service.ensureAccountAcceptsJournalLines(1)).rejects.toThrow(/not a leaf account/);
  });

  it('ensureAccountAcceptsJournalLines returns account when valid leaf', async () => {
    const acc = { id: 7, isLeaf: true } as Account;
    mockRepo.findOne.mockResolvedValue(acc);
    mockRepo.count.mockResolvedValue(0);
    await expect(service.ensureAccountAcceptsJournalLines(7)).resolves.toBe(acc);
  });

  it('setOpeningBalance forbids system accounts', async () => {
    mockRepo.findOne.mockResolvedValue({ id: 1, isSystem: true } as Account);
    await expect(service.setOpeningBalance(1, 100)).rejects.toThrow(ForbiddenException);
  });

  it('setOpeningBalance rejects non-leaf accounts (V1)', async () => {
    mockRepo.findOne.mockResolvedValue({
      id: 1,
      isSystem: false,
      isLeaf: false,
      openingBalance: 0 as unknown as number,
      openingBalanceLocked: false,
    } as Account);
    mockRepo.count.mockResolvedValue(0);
    await expect(service.setOpeningBalance(1, 100)).rejects.toThrow(/leaf accounts/);
  });

  it('setOpeningBalance rejects when already locked', async () => {
    mockRepo.findOne.mockResolvedValue({
      id: 1,
      isSystem: false,
      isLeaf: true,
      openingBalanceLocked: true,
    } as Account);
    mockRepo.count.mockResolvedValue(0);
    await expect(service.setOpeningBalance(1, 50)).rejects.toThrow(/already been set/);
  });

  it('setOpeningBalance updates and returns refreshed row', async () => {
    mockRepo.findOne
      .mockResolvedValueOnce({
        id: 2,
        isSystem: false,
        isLeaf: true,
        openingBalance: 0 as unknown as number,
        openingBalanceLocked: false,
      } as Account)
      .mockResolvedValueOnce({
        id: 2,
        openingBalance: 250,
        openingBalanceLocked: true,
      } as Account);
    const updated = await service.setOpeningBalance(2, 250, 'u1');
    expect(updated.openingBalance).toBe(250);
    expect(mockRepo.update).toHaveBeenCalledWith(
      2,
      expect.objectContaining({
        openingBalance: 250,
        openingBalanceLocked: true,
        updatedBy: 'u1',
      }),
    );
  });

  it('update forbids system accounts', async () => {
    mockRepo.findOne.mockResolvedValue({
      id: 1,
      isSystem: true,
      parentAccount: null,
    } as unknown as Account);
    await expect(service.update({ id: 1, name: 'x' } as Account)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('delete forbids accounts with children', async () => {
    mockRepo.findOne.mockResolvedValue({
      id: 1,
      name: 'P',
      isSystem: false,
      childAccounts: [{ id: 2 }],
      transactionLines: [],
    } as unknown as Account);
    await expect(service.delete(1)).rejects.toThrow(/child account/);
  });

  it('delete forbids accounts with transaction lines', async () => {
    mockRepo.findOne.mockResolvedValue({
      id: 1,
      name: 'L',
      isSystem: false,
      childAccounts: [],
      transactionLines: [{ id: 9 }],
    } as unknown as Account);
    await expect(service.delete(1)).rejects.toThrow(/transaction line/);
  });

  it('delete removes leaf and restores parent isLeaf when last child removed', async () => {
    mockRepo.findOne.mockResolvedValue({
      id: 10,
      name: 'Leaf',
      isSystem: false,
      childAccounts: [],
      transactionLines: [],
      parentAccount: { id: 5 } as Account,
    } as unknown as Account);
    mockRepo.count.mockResolvedValue(0);
    await service.delete(10);
    expect(mockRepo.delete).toHaveBeenCalledWith(10);
    expect(mockRepo.update).toHaveBeenCalledWith(5, { isLeaf: true });
  });

  it('isDescendant is true along parent chain', async () => {
    mockRepo.findOne.mockImplementation((opts: { where: { id: number } }) => {
      const id = opts.where.id;
      if (id === 3)
        return Promise.resolve({ id: 3, parentAccount: { id: 2 } } as unknown as Account);
      if (id === 2)
        return Promise.resolve({ id: 2, parentAccount: { id: 1 } } as unknown as Account);
      if (id === 1)
        return Promise.resolve({ id: 1, parentAccount: undefined } as unknown as Account);
      return Promise.resolve(null);
    });
    await expect(service.isDescendant(3, 1)).resolves.toBe(true);
    await expect(service.isDescendant(1, 3)).resolves.toBe(false);
  });

  it('findAndCount applies pagination to query builder', async () => {
    const qb = {
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    };
    mockRepo.createQueryBuilder.mockReturnValue(qb);
    await service.findAndCount({ page: 2, pageSize: 5 } as QueryAccountDTO);
    expect(qb.skip).toHaveBeenCalledWith(5);
    expect(qb.take).toHaveBeenCalledWith(5);
  });
});

describe('TransactionService (save / update / delete)', () => {
  let service: TransactionService;
  let mockRepo: {
    findOne: jest.Mock;
    save: jest.Mock;
    delete: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let accountServiceMock: { lockOpeningBalancesAfterJournalActivity: jest.Mock };

  beforeEach(async () => {
    accountServiceMock = {
      lockOpeningBalancesAfterJournalActivity: jest.fn().mockResolvedValue(undefined),
    };
    mockRepo = {
      findOne: jest.fn().mockResolvedValue(null),
      save: jest.fn((t: Transaction) => Promise.resolve({ ...t, id: t.id ?? 1 })),
      delete: jest.fn(),
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

  const balancedTx = (): Transaction =>
    ({
      transactionLines: [
        {
          entryType: EntryType.DEBIT,
          amount: 75,
          account: { id: 1 },
        } as TransactionLine,
        {
          entryType: EntryType.CREDIT,
          amount: 75,
          account: { id: 2 },
        } as TransactionLine,
      ],
    }) as Transaction;

  it('save validates balance and persists', async () => {
    const tx = balancedTx();
    const saved = await service.save(tx);
    expect(saved.code).toBe('CODE-MOCK-1');
    expect(mockRepo.save).toHaveBeenCalled();
    expect(accountServiceMock.lockOpeningBalancesAfterJournalActivity).toHaveBeenCalledWith(
      expect.objectContaining({ transactionLines: expect.any(Array) }),
    );
  });

  it('update allows changes when persisted status is DRAFT', async () => {
    mockRepo.findOne.mockResolvedValue({ id: 3, status: TransactionStatus.DRAFT });
    const tx = { ...balancedTx(), id: 3, status: TransactionStatus.DRAFT } as Transaction;
    await service.update(tx);
    expect(mockRepo.save).toHaveBeenCalled();
  });

  it('delete delegates to repository', async () => {
    await service.delete(9);
    expect(mockRepo.delete).toHaveBeenCalledWith(9);
  });
});

describe('TransactionLineService (CRUD)', () => {
  let service: TransactionLineService;
  let mockRepo: { findOne: jest.Mock; save: jest.Mock; delete: jest.Mock; find: jest.Mock };

  beforeEach(async () => {
    mockRepo = {
      findOne: jest.fn(),
      save: jest.fn((l: TransactionLine) => Promise.resolve({ ...l, id: 1 })),
      delete: jest.fn(),
      find: jest.fn(),
    };
    const moduleRef = await Test.createTestingModule({
      providers: [
        TransactionLineService,
        { provide: getRepositoryToken(TransactionLine), useValue: mockRepo },
      ],
    }).compile();
    service = moduleRef.get(TransactionLineService);
  });

  it('save sets timestamps and delegates to repository', async () => {
    const line = { amount: 10 } as TransactionLine;
    const out = await service.save(line, 'creator');
    expect(out.id).toBe(1);
    expect(mockRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        createdBy: 'creator',
        updatedBy: 'creator',
      }),
    );
  });

  it('update sets updatedBy when provided', async () => {
    await service.update({ id: 5, amount: 20 } as TransactionLine, 'editor');
    expect(mockRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ id: 5, updatedBy: 'editor' }),
    );
  });

  it('delete delegates to repository', async () => {
    await service.delete(4);
    expect(mockRepo.delete).toHaveBeenCalledWith(4);
  });

  it('findByFields proxies findOne', async () => {
    mockRepo.findOne.mockResolvedValue({ id: 2 } as TransactionLine);
    await expect(service.findByFields({ where: { id: 2 } })).resolves.toEqual({ id: 2 });
  });
});
