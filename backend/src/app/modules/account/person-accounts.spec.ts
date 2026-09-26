import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

jest.mock('src/core/utils/generator', () => ({
  generateUniqueCode: jest.fn().mockResolvedValue('CODE-PERSON-1'),
}));

import { AccountService } from './account.service';
import { Account, AccountType, normalBalanceType } from './account.entity';
import { TransactionLine, EntryType } from '../transaction-line/transaction-line.entity';
import { TransactionService } from '../transaction/transaction.service';
import { Transaction, TransactionStatus } from '../transaction/transaction.entity';
import { Employee } from '../employee/employee.entity';
import {
  ACCOUNT_PARENT_CUSTODY,
  ACCOUNT_PARENT_LOAN,
  ACCOUNT_PARENT_SALARIES,
  buildPersonAccountName,
  PERSON_ACCOUNT_PARENTS,
} from './person-account.constants';
import { UserRole } from 'src/core/enums/user-role';

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
    sum: jest.fn().mockResolvedValue(0),
    createQueryBuilder: jest.fn().mockReturnValue({
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(0),
    }),
  };
}

describe('person-account.constants', () => {
  it('buildPersonAccountName joins first and last name', () => {
    expect(buildPersonAccountName('Ahmed', 'Hassan')).toBe('Ahmed Hassan');
  });

  it('buildPersonAccountName uses fallback when names are empty', () => {
    expect(buildPersonAccountName('', '', 'Employee 5')).toBe('Employee 5');
  });

  it('maps role parents per plan', () => {
    expect(PERSON_ACCOUNT_PARENTS[UserRole.DRIVER]).toEqual([
      ACCOUNT_PARENT_CUSTODY,
      ACCOUNT_PARENT_SALARIES,
    ]);
    expect(PERSON_ACCOUNT_PARENTS[UserRole.DRIVER_ASSISTANT]).toEqual([ACCOUNT_PARENT_SALARIES]);
    expect(PERSON_ACCOUNT_PARENTS[UserRole.DATA_ENTRY]).toEqual([
      ACCOUNT_PARENT_CUSTODY,
      ACCOUNT_PARENT_LOAN,
      ACCOUNT_PARENT_SALARIES,
    ]);
  });
});

describe('AccountService — person sub-accounts', () => {
  let service: AccountService;
  let mockRepo: ReturnType<typeof createAccountRepoMock>;
  let mockTlRepo: ReturnType<typeof createTransactionLineRepoMock>;
  let transactionService: { save: jest.Mock };

  const custodyParent = {
    id: 10,
    name: ACCOUNT_PARENT_CUSTODY,
    type: AccountType.ASSET,
    normalBalance: normalBalanceType.DEBIT,
  } as Account;

  const salariesParent = {
    id: 20,
    name: ACCOUNT_PARENT_SALARIES,
    type: AccountType.LIABILITY,
    normalBalance: normalBalanceType.CREDIT,
  } as Account;

  const loanParent = {
    id: 30,
    name: ACCOUNT_PARENT_LOAN,
    type: AccountType.ASSET,
    normalBalance: normalBalanceType.DEBIT,
  } as Account;

  beforeEach(async () => {
    mockRepo = createAccountRepoMock();
    mockRepo.find.mockResolvedValue([]);
    mockTlRepo = createTransactionLineRepoMock();
    transactionService = { save: jest.fn().mockResolvedValue({ id: 1 } as Transaction) };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AccountService,
        { provide: getRepositoryToken(Account), useValue: mockRepo },
        { provide: getRepositoryToken(TransactionLine), useValue: mockTlRepo },
        { provide: TransactionService, useValue: transactionService },
      ],
    }).compile();

    service = moduleRef.get(AccountService);
  });

  function mockParentLookup(parents: Record<string, Account>) {
    mockRepo.findOne.mockImplementation(async (opts: { where: Record<string, unknown> }) => {
      const where = opts.where as { name?: string; parentAccount?: { id: number }; id?: number };
      if (where.name && !where.parentAccount) {
        return parents[where.name] ?? null;
      }
      if (where.name && where.parentAccount?.id != null) {
        const parent = Object.values(parents).find((p) => p.id === where.parentAccount!.id);
        if (!parent) return null;
        return null;
      }
      if (where.id != null) {
        return Object.values(parents).find((p) => p.id === where.id) ?? null;
      }
      return null;
    });
  }

  it('createPersonSubAccounts rejects empty person name', async () => {
    await expect(service.createPersonSubAccounts('   ', [ACCOUNT_PARENT_CUSTODY])).rejects.toThrow(
      BadRequestException,
    );
  });

  it('createPersonSubAccounts throws when parent is missing', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    await expect(
      service.createPersonSubAccounts('Ahmed Hassan', [ACCOUNT_PARENT_CUSTODY]),
    ).rejects.toThrow(/Parent account "عهد" not found/);
  });

  it('createPersonSubAccounts is idempotent when child already exists', async () => {
    const existing = {
      id: 99,
      name: 'Ahmed Hassan',
      parentAccount: custodyParent,
    } as Account;

    mockRepo.findOne.mockImplementation(async (opts: { where: Record<string, unknown> }) => {
      const where = opts.where as { name?: string; parentAccount?: { id: number } };
      if (where.name === ACCOUNT_PARENT_CUSTODY && !where.parentAccount) return custodyParent;
      if (where.name === 'Ahmed Hassan' && where.parentAccount?.id === custodyParent.id) {
        return existing;
      }
      return null;
    });

    const result = await service.createPersonSubAccounts('Ahmed Hassan', [ACCOUNT_PARENT_CUSTODY]);
    expect(result).toEqual([existing]);
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('createPersonSubAccounts creates عهد child as CASH under ASSET parent', async () => {
    mockParentLookup({ [ACCOUNT_PARENT_CUSTODY]: custodyParent });
    mockRepo.save.mockImplementation((account: Account) =>
      Promise.resolve({ ...account, id: 101 }),
    );

    const [created] = await service.createPersonSubAccounts(
      'Ahmed Hassan',
      [ACCOUNT_PARENT_CUSTODY],
      'admin@test.com',
    );

    expect(created.name).toBe('Ahmed Hassan');
    expect(created.type).toBe(AccountType.CASH);
    expect(created.normalBalance).toBe(normalBalanceType.DEBIT);
    expect(mockRepo.save).toHaveBeenCalled();
    expect(mockRepo.update).toHaveBeenCalledWith(custodyParent.id, { isLeaf: false });
  });

  it('createPersonSubAccounts creates رواتب child inheriting LIABILITY from parent', async () => {
    mockParentLookup({ [ACCOUNT_PARENT_SALARIES]: salariesParent });
    mockRepo.save.mockImplementation((account: Account) =>
      Promise.resolve({ ...account, id: 102 }),
    );

    const [created] = await service.createPersonSubAccounts('Sara Ali', [ACCOUNT_PARENT_SALARIES]);

    expect(created.type).toBe(AccountType.LIABILITY);
    expect(created.normalBalance).toBe(normalBalanceType.CREDIT);
  });

  it('createPersonSubAccounts provisions all employee parents in one call', async () => {
    mockParentLookup({
      [ACCOUNT_PARENT_CUSTODY]: custodyParent,
      [ACCOUNT_PARENT_LOAN]: loanParent,
      [ACCOUNT_PARENT_SALARIES]: salariesParent,
    });
    mockRepo.save.mockImplementation((account: Account) =>
      Promise.resolve({ ...account, id: Math.floor(Math.random() * 1000) }),
    );

    const parents = PERSON_ACCOUNT_PARENTS[UserRole.DATA_ENTRY]!;
    const created = await service.createPersonSubAccounts('Maktab User', parents);

    expect(created).toHaveLength(3);
    expect(mockRepo.save).toHaveBeenCalledTimes(3);
  });

  it('findPersonSubAccount resolves by parent Arabic name and person name', async () => {
    const child = { id: 55, name: 'Ahmed Hassan', parentAccount: custodyParent } as Account;
    mockRepo.findOne.mockImplementation(async (opts: { where: Record<string, unknown> }) => {
      const where = opts.where as { name?: string; parentAccount?: { id: number } };
      if (where.name === ACCOUNT_PARENT_CUSTODY && !where.parentAccount) return custodyParent;
      if (where.name === 'Ahmed Hassan' && where.parentAccount?.id === custodyParent.id) {
        return child;
      }
      return null;
    });

    await expect(
      service.findPersonSubAccount('Ahmed Hassan', ACCOUNT_PARENT_CUSTODY),
    ).resolves.toBe(child);
  });

  it('findPersonSubAccount throws when child is missing under parent', async () => {
    mockRepo.findOne.mockImplementation(async (opts: { where: Record<string, unknown> }) => {
      const where = opts.where as { name?: string; parentAccount?: { id: number } };
      if (where.name === ACCOUNT_PARENT_CUSTODY && !where.parentAccount) return custodyParent;
      return null;
    });

    await expect(
      service.findPersonSubAccount('Missing Person', ACCOUNT_PARENT_CUSTODY),
    ).rejects.toThrow(/Account for "Missing Person" under "عهد" not found/);
  });

  it('findAccountForEmployee scopes lookup to عهد parent', async () => {
    const child = { id: 77, name: 'Office Employee', parentAccount: custodyParent } as Account;
    const findSpy = jest.spyOn(service, 'findPersonSubAccount').mockResolvedValue(child);

    const employee = {
      id: 5,
      user: { firstName: 'Office', lastName: 'Employee' },
    } as Employee;

    await expect(service.findAccountForEmployee(employee)).resolves.toBe(child);
    expect(findSpy).toHaveBeenCalledWith('Office Employee', ACCOUNT_PARENT_CUSTODY);
  });

  it('createEmployeeCustodyAccount uses existing custody sub-account then posts transaction', async () => {
    const inventory = { id: 1, name: 'الخزينه' } as Account;
    const custodyChild = { id: 88, name: 'Office Employee' } as Account;

    jest.spyOn(service, 'checkAvailableBalance').mockResolvedValue(true);
    jest.spyOn(service, 'findPersonSubAccount').mockResolvedValue(custodyChild);

    mockRepo.findOne.mockImplementation(async (opts: { where: { name?: string } }) => {
      if (opts.where.name === 'الخزينه') return inventory;
      return null;
    });

    const employee = {
      id: 5,
      user: { firstName: 'Office', lastName: 'Employee' },
    } as Employee;

    await service.createEmployeeCustodyAccount(employee, 1000);

    expect(service.findPersonSubAccount).toHaveBeenCalledWith(
      'Office Employee',
      ACCOUNT_PARENT_CUSTODY,
      undefined,
    );
    expect(transactionService.save).toHaveBeenCalledWith(
      expect.objectContaining({
        status: TransactionStatus.POSTED,
        transactionLines: expect.arrayContaining([
          expect.objectContaining({
            account: custodyChild,
            amount: 1000,
            entryType: EntryType.DEBIT,
          }),
          expect.objectContaining({
            account: inventory,
            amount: 1000,
            entryType: EntryType.CREDIT,
          }),
        ]),
      }),
      undefined,
      undefined,
    );
  });

  it('custodyMovement credits the source account and debits the destination', async () => {
    const treasury = { id: 1, name: 'الخزينه' } as Account;
    const custodyChild = { id: 88, name: 'Office Employee' } as Account;

    jest.spyOn(service, 'checkAvailableBalance').mockResolvedValue(true);

    await service.custodyMovement(treasury, custodyChild, 1000);

    expect(transactionService.save).toHaveBeenCalledWith(
      expect.objectContaining({
        status: TransactionStatus.POSTED,
        transactionLines: expect.arrayContaining([
          expect.objectContaining({
            account: treasury,
            amount: 1000,
            entryType: EntryType.CREDIT,
          }),
          expect.objectContaining({
            account: custodyChild,
            amount: 1000,
            entryType: EntryType.DEBIT,
          }),
        ]),
      }),
      undefined,
      undefined,
    );
  });

  it('createPersonSubAccounts uses EntityManager repository when provided', async () => {
    const managerRepo = createAccountRepoMock();
    const manager = {
      getRepository: jest.fn().mockReturnValue(managerRepo),
    } as unknown as EntityManager;

    managerRepo.findOne.mockImplementation(async (opts: { where: Record<string, unknown> }) => {
      const where = opts.where as { name?: string; id?: number; parentAccount?: { id: number } };
      if (where.id === salariesParent.id) return salariesParent;
      if (where.name === ACCOUNT_PARENT_SALARIES && !where.parentAccount) return salariesParent;
      return null;
    });
    managerRepo.save.mockImplementation((account: Account) =>
      Promise.resolve({ ...account, id: 201 }),
    );

    await service.createPersonSubAccounts(
      'Assistant One',
      [ACCOUNT_PARENT_SALARIES],
      'system',
      manager,
    );

    expect(manager.getRepository).toHaveBeenCalledWith(Account);
    expect(managerRepo.save).toHaveBeenCalled();
    expect(mockRepo.save).not.toHaveBeenCalled();
  });
});
