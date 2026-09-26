import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, FindOneOptions, EntityManager } from 'typeorm';
import { Account, AccountType, normalBalanceType } from './account.entity';
import { EntryType, TransactionLine } from '../transaction-line/transaction-line.entity';
import { Transaction, TransactionStatus } from '../transaction/transaction.entity';
import { generateUniqueCode } from 'src/core/utils/generator';
import { GeneratorTypes } from 'src/core/enums/generator-types';
import { QueryAccountDTO, parseParentAccountIdQuery } from './dtos/query-account.dto';
import { Employee } from '../employee/employee.entity';
import { TransactionService } from '../transaction/transaction.service';
import {
  ACCOUNT_PARENT_CUSTODY,
  buildPersonAccountName,
} from './person-account.constants';

/**
 * Chart-of-accounts hierarchy rules (PostgreSQL self-FK on parent_account_id):
 *
 * 1) Classification inheritance — `normalBalance` always matches the parent. `type` must
 *    match the parent, except CASH is allowed under an ASSET parent (cash/bank sub-ledgers).
 *    Any other mismatch is rejected. Roots may use any valid pair.
 *
 * 2) Postings — Journal lines target leaf accounts only (`isLeaf` + no children). Parent
 *    rows are structural; their economic balance is the roll-up of descendant leaves via
 *    transaction_lines (this schema does not store current_balance on accounts).
 *
 * 3) Leaf flag — Maintained when children are added/removed; use `hasChildAccounts` /
 *    `isLeafAccount` for defense-in-depth at posting time.
 *
 * 4) normalBalance — Immutable after insert: roots set it once at create; children inherit
 *    from the parent (do not send a conflicting value on create).
 */
function toNumberAmount(value: unknown): number {
  if (value === null || value === undefined) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(TransactionLine)
    private readonly transactionLineRepository: Repository<TransactionLine>,
    @Inject(forwardRef(() => TransactionService))
    private readonly transactionService: TransactionService,
  ) { }

  /**
   * Validates child `type` under this parent. CASH is permitted only under ASSET; otherwise
   * the child type must equal the parent's type.
   */
  /**
   * Root accounts: `normalBalance` must match `type` (A2 — ASSET/EXPENSE/CASH → DEBIT; LIABILITY/EQUITY/REVENUE → CREDIT).
   */
  assertRootNormalBalanceMatchesType(type: AccountType, normalBalance: normalBalanceType): void {
    const debitNormalTypes: AccountType[] = [
      AccountType.ASSET,
      AccountType.EXPENSE,
      AccountType.CASH,
    ];
    const creditNormalTypes: AccountType[] = [
      AccountType.LIABILITY,
      AccountType.EQUITY,
      AccountType.REVENUE,
    ];
    if (debitNormalTypes.includes(type) && normalBalance !== normalBalanceType.DEBIT) {
      throw new BadRequestException(
        `For account type "${type}", normalBalance must be DEBIT.`,
      );
    }
    if (creditNormalTypes.includes(type) && normalBalance !== normalBalanceType.CREDIT) {
      throw new BadRequestException(
        `For account type "${type}", normalBalance must be CREDIT.`,
      );
    }
  }

  assertChildTypeAllowedUnderParent(parentType: AccountType, childType: AccountType): void {
    if (parentType === childType) return;
    if (parentType === AccountType.ASSET && childType === AccountType.CASH) return;
    throw new BadRequestException(
      `Account type "${childType}" is not allowed under a "${parentType}" parent. Use "${parentType}"` +
      (parentType === AccountType.ASSET ? ', or CASH for cash/bank style accounts.' : '.'),
    );
  }

  async findById(id: number): Promise<Account | undefined> {
    const result = await this.accountRepository.findOne({
      where: { id },
      relations: ['childAccounts', 'parentAccount'],
    });
    return result || undefined;
  }

  async findByFields(options: FindOneOptions<Account>): Promise<Account | undefined> {
    const result = await this.accountRepository.findOne(options);
    return result || undefined;
  }

  async find(options: FindManyOptions<Account>): Promise<Account[]> {
    return await this.accountRepository.find(options);
  }

  async findAndCount(query: QueryAccountDTO): Promise<[Account[], number]> {
    const page = +(query.page ?? 1);
    const pageSize = +(query.pageSize ?? 10);
    const skip = (page - 1) * pageSize;
    const order = query.sortField ? query.sortOrder || 'ASC' : 'DESC';
    const orderField = query.sortField ?? 'id';

    const qb = this.accountRepository
      .createQueryBuilder('account')
      .skip(skip)
      .take(pageSize)
      .orderBy(`account.${orderField}`, order);

    if (query.search?.trim()) {
      const term = `%${query.search.trim()}%`;
      qb.andWhere('(account.code ILIKE :term OR account.name ILIKE :term)', { term });
    }

    if (query.type) {
      qb.andWhere('account.type = :type', { type: query.type });
    }

    const hasSearch = Boolean(query.search?.trim());

    // Tree filters (parent / leaf) conflict with "find this account" — scoped rows hide matches under another parent or with different isLeaf
    if (!hasSearch && query.isLeaf !== undefined) {
      qb.andWhere('account.isLeaf = :isLeaf', { isLeaf: query.isLeaf });
    }

    if (query.includeParent !== false) {
      qb.leftJoinAndSelect('account.parentAccount', 'parentAccount');
    }

    if (query.createdAtFrom) {
      qb.andWhere('account.createdAt >= :createdAtFrom', { createdAtFrom: query.createdAtFrom });
    }

    if (query.createdAtTo) {
      qb.andWhere('account.createdAt <= :createdAtTo', { createdAtTo: query.createdAtTo });
    }

    // Normalize query string values (e.g. "null") — works even when global ValidationPipe has transform: false
    const parentAccountId = parseParentAccountIdQuery(query.parentAccountId as unknown);
    if (!hasSearch && parentAccountId === null) {
      qb.andWhere('account.parent_account_id IS NULL');
    } else if (!hasSearch && parentAccountId !== undefined) {
      qb.andWhere('account.parent_account_id = :parentAccountId', {
        parentAccountId,
      });
    }

    return qb.getManyAndCount();
  }

  /**
   * True when the account has at least one child row (structural parent, not postable).
   */
  async hasChildAccounts(accountId: number): Promise<boolean> {
    const n = await this.accountRepository.count({
      where: { parentAccount: { id: accountId } },
    });
    return n > 0;
  }

  /**
   * True when the account has no children (same idea as `isLeaf` when the flag is in sync).
   */
  async isLeafAccount(accountId: number): Promise<boolean> {
    return !(await this.hasChildAccounts(accountId));
  }

  /**
   * Parent id and every descendant account id (BFS), including `rootId`.
   */
  async collectBranchAccountIds(rootId: number): Promise<number[]> {
    const all = await this.accountRepository.find({ relations: ['parentAccount'] });
    const childrenByParent = new Map<number, number[]>();
    for (const a of all) {
      const p = a.parentAccount?.id;
      if (p == null) continue;
      if (!childrenByParent.has(p)) childrenByParent.set(p, []);
      childrenByParent.get(p)!.push(a.id);
    }
    const out: number[] = [];
    const queue: number[] = [rootId];
    while (queue.length) {
      const id = queue.shift()!;
      out.push(id);
      const kids = childrenByParent.get(id) ?? [];
      queue.push(...kids);
    }
    return out;
  }

  /** Posted journal lines on any account in the branch (parent + subtree). Used for N2. */
  async countPostedLinesInBranch(rootAccountId: number): Promise<number> {
    const branchIds = await this.collectBranchAccountIds(rootAccountId);
    if (branchIds.length === 0) return 0;
    return this.transactionLineRepository
      .createQueryBuilder('tl')
      .innerJoin('tl.transaction', 't')
      .where('tl.account_id IN (:...ids)', { ids: branchIds })
      .andWhere('t.status = :posted', { posted: TransactionStatus.POSTED })
      .getCount();
  }

  /**
   * After journal lines are persisted, opening balances on those leaf accounts are read-only (O3/T4).
   */
  async lockOpeningBalancesAfterJournalActivity(
    transaction: {
      transactionLines?: Array<{ account?: { id?: number } }>;
    },
    manager?: EntityManager,
  ): Promise<void> {
    const lines = transaction.transactionLines;
    if (!lines?.length) return;
    const repo = manager ? manager.getRepository(Account) : this.accountRepository;
    const ids = new Set<number>();
    for (const line of lines) {
      const id = line.account?.id;
      if (id != null) ids.add(id);
    }
    const now = new Date();
    for (const id of ids) {
      await repo.update(id, { openingBalanceLocked: true, updatedAt: now });
    }
  }

  /**
   * Ensures the account may receive journal postings: exists, active, leaf, and no children.
   * Parent/header rows must not receive lines; balances for reporting roll up from leaves.
   */
  async ensureAccountAcceptsJournalLines(accountId: number): Promise<Account> {
    const account = await this.findById(accountId);
    if (!account) {
      throw new NotFoundException(`Account with id ${accountId} not found`);
    }

    const hasChildren = await this.hasChildAccounts(accountId);
    if (hasChildren || account.isLeaf !== true) {
      throw new BadRequestException(
        `Account with id ${accountId} is not a leaf account. Post only to accounts with no sub-accounts.`,
      );
    }
    return account;
  }

  async save(account: Account, creator?: string, manager?: EntityManager): Promise<Account> {
    const now = new Date();
    const accountRepository = manager?.getRepository(Account) ?? this.accountRepository;

    const parentId = account.parentAccount?.id;
    if (parentId != null) {
      const parent = await accountRepository.findOne({ where: { id: parentId } });
      if (!parent) {
        throw new NotFoundException(`Parent account with id ${parentId} not found`);
      }
      if (account.normalBalance != null && account.normalBalance !== parent.normalBalance) {
        throw new BadRequestException(
          'Child accounts inherit normalBalance from the parent. Omit normalBalance when creating under a parent.',
        );
      }
      account.normalBalance = parent.normalBalance;
      if (account.type === undefined || account.type === null) {
        account.type = parent.type;
      }
      this.assertChildTypeAllowedUnderParent(parent.type, account.type);
    } else if (account.type == null || account.normalBalance == null) {
      throw new BadRequestException(
        'Root accounts must include both type and normalBalance (no parent to inherit from).',
      );
    } else {
      this.assertRootNormalBalanceMatchesType(account.type, account.normalBalance);
    }

    const parentIdForBranch = account.parentAccount?.id;
    if (parentIdForBranch != null) {
      const openingNum = toNumberAmount(account.openingBalance);
      if (Math.abs(openingNum) > 0.01) {
        const postedInBranch = await this.countPostedLinesInBranch(parentIdForBranch);
        if (postedInBranch > 0) {
          throw new BadRequestException(
            'A non-zero opening balance is not allowed under this account because the branch already has posted transactions. Create the account with opening balance 0.',
          );
        }
      }
    }

    if (!account.code) {
      account.code = await generateUniqueCode(
        accountRepository,
        GeneratorTypes.ACCOUNT,
        'code',
      );
    }

    if (account.openingBalanceLocked === true) {
      // e.g. create with optional openingBalance — keep value and lock from mapper
    } else {
      if (account.openingBalance === undefined || account.openingBalance === null) {
        account.openingBalance = 0 as unknown as number;
      }
      account.openingBalanceLocked = false;
    }

    account.createdAt = account.createdAt ?? now;
    account.updatedAt = now;

    if (creator) {
      account.createdBy = account.createdBy ?? creator;
      account.updatedBy = creator;
    }

    const saved = await accountRepository.save(account);

    // Mark the parent as non-leaf since it now has a child
    if (account.parentAccount?.id) {
      await accountRepository.update(account.parentAccount.id, { isLeaf: false });
    }

    return saved;
  }

  /**
   * Sets the stored opening balance once. Not allowed for system chart accounts or if already locked.
   */
  async setOpeningBalance(id: number, amount: number, updater?: string): Promise<Account> {
    const account = await this.accountRepository.findOne({ where: { id } });
    if (!account) {
      throw new NotFoundException(`Account with id ${id} not found`);
    }
    if (account.isLeaf !== true || (await this.hasChildAccounts(id))) {
      throw new BadRequestException('Opening balance can only be set on leaf accounts.');
    }
    if (account.openingBalanceLocked) {
      throw new BadRequestException(
        'Opening balance has already been set for this account and cannot be changed.',
      );
    }
    if (Math.abs(toNumberAmount(account.openingBalance)) > 0.01) {
      throw new BadRequestException(
        'Opening balance can only be set when the current opening balance is zero.',
      );
    }
    const lineCount = await this.transactionLineRepository.count({
      where: { account: { id } },
    });
    if (lineCount > 0) {
      throw new BadRequestException(
        'Opening balance cannot be changed while the account has transaction lines.',
      );
    }
    const now = new Date();
    await this.accountRepository.update(id, {
      openingBalance: amount,
      openingBalanceLocked: true,
      updatedAt: now,
      ...(updater ? { updatedBy: updater } : {}),
    });
    const updated = await this.accountRepository.findOne({ where: { id } });
    if (!updated) {
      throw new NotFoundException(`Account with id ${id} not found`);
    }
    return updated;
  }

  async update(account: Account, updater?: string): Promise<Account> {
    const now = new Date();
    account.updatedAt = now;
    if (updater) account.updatedBy = updater;

    // Re-fetch the current state to capture the old parent before saving
    const current = await this.accountRepository.findOne({
      where: { id: account.id },
      relations: ['parentAccount'],
    });

    if (!current) {
      throw new NotFoundException(`Account with id ${account.id} not found`);
    }
    if (current.isSystem) {
      throw new ForbiddenException(
        'This account is part of the system chart of accounts and cannot be modified.',
      );
    }

    const oldParentId = current.parentAccount?.id ?? null;
    const newParentId = account.parentAccount?.id ?? null;

    // Under a parent, type & normalBalance always follow the parent (chart consistency)
    const effectiveParentId = newParentId ?? oldParentId;
    if (effectiveParentId != null) {
      const parent = await this.accountRepository.findOne({ where: { id: effectiveParentId } });
      if (!parent) {
        throw new NotFoundException(`Parent account with id ${effectiveParentId} not found`);
      }
      account.normalBalance = parent.normalBalance;
      if (account.type === undefined || account.type === null) {
        account.type = parent.type;
      }
      this.assertChildTypeAllowedUnderParent(parent.type, account.type);
    } else {
      // Root account: normalBalance is fixed at creation and cannot be changed via update
      account.normalBalance = current.normalBalance;
    }

    const saved = await this.accountRepository.save(account);

    // New parent gains a child → mark as non-leaf
    if (newParentId) {
      await this.accountRepository.update(newParentId, { isLeaf: false });
    }

    // Old parent lost this child → restore as leaf if no remaining children
    if (oldParentId && oldParentId !== newParentId) {
      const remainingChildren = await this.accountRepository.count({
        where: { parentAccount: { id: oldParentId } },
      });
      if (remainingChildren === 0) {
        await this.accountRepository.update(oldParentId, { isLeaf: true });
      }
    }

    return saved;
  }

  async delete(id: number): Promise<void> {
    const account = await this.accountRepository.findOne({
      where: { id },
      relations: ['childAccounts', 'transactionLines', 'parentAccount'],
    });

    if (!account) throw new NotFoundException(`Account with id ${id} not found`);

    if (account.isSystem) {
      throw new ForbiddenException(
        'This account is part of the system chart of accounts and cannot be deleted.',
      );
    }

    if (account.childAccounts && account.childAccounts.length > 0) {
      throw new BadRequestException(
        `Cannot delete account "${account.name}" because it has ${account.childAccounts.length} child account(s). Remove or reassign child accounts first.`,
      );
    }

    if (account.transactionLines && account.transactionLines.length > 0) {
      throw new BadRequestException(
        `Cannot delete account "${account.name}" because it has ${account.transactionLines.length} transaction line(s) linked to it.`,
      );
    }

    const parentId = account.parentAccount?.id ?? null;

    await this.accountRepository.delete(id);

    // If parent has no more children, restore it as a leaf account
    if (parentId) {
      const remainingChildren = await this.accountRepository.count({
        where: { parentAccount: { id: parentId } },
      });
      if (remainingChildren === 0) {
        await this.accountRepository.update(parentId, { isLeaf: true });
      }
    }
  }

  /**
   * Returns true when `potentialDescendantId` is a descendant (direct or indirect child)
   * of `ancestorId`. Used to prevent circular parent assignments.
   */
  async isDescendant(potentialDescendantId: number, ancestorId: number): Promise<boolean> {
    const visited = new Set<number>();
    let currentId: number | null = potentialDescendantId;

    while (currentId !== null) {
      if (visited.has(currentId)) break; // cycle guard
      if (currentId === ancestorId) return true;

      visited.add(currentId);

      const account = await this.accountRepository.findOne({
        where: { id: currentId },
        relations: ['parentAccount'],
      });

      currentId = account?.parentAccount?.id ?? null;
    }

    return false;
  }



  async findPersonSubAccount(
    personName: string,
    parentNameArabic: string,
    manager?: EntityManager,
  ): Promise<Account> {
    const accountRepo = manager?.getRepository(Account) ?? this.accountRepository;
    const trimmed = personName.trim();
    const parent = await accountRepo.findOne({ where: { name: parentNameArabic } });
    if (!parent) {
      throw new NotFoundException(`Parent account "${parentNameArabic}" not found`);
    }

    const account = await accountRepo.findOne({
      where: { name: trimmed, parentAccount: { id: parent.id } },
      relations: ['parentAccount'],
    });
    if (!account) {
      throw new NotFoundException(
        `Account for "${trimmed}" under "${parentNameArabic}" not found`,
      );
    }

    return account;
  }

  async createPersonSubAccounts(
    personName: string,
    parentNames: string[],
    creator?: string,
    manager?: EntityManager,
  ): Promise<Account[]> {
    const trimmed = personName.trim();
    if (!trimmed) {
      throw new BadRequestException('Person name is required to create sub-accounts');
    }

    const accountRepo = manager?.getRepository(Account) ?? this.accountRepository;
    const created: Account[] = [];

    for (const parentName of parentNames) {
      const parent = await accountRepo.findOne({ where: { name: parentName } });
      if (!parent) {
        throw new NotFoundException(`Parent account "${parentName}" not found`);
      }

      const existing = await accountRepo.findOne({
        where: { name: trimmed, parentAccount: { id: parent.id } },
        relations: ['parentAccount'],
      });

      if (existing) {
        created.push(existing);
        continue;
      }

      const child = new Account();
      child.name = trimmed;
      child.parentAccount = parent;
      child.isLeaf = true;
      if (parentName === ACCOUNT_PARENT_CUSTODY && parent.type === AccountType.ASSET) {
        child.type = AccountType.CASH;
      }

      const saved = await this.save(child, creator, manager);
      created.push(saved);
    }

    return created;
  }

  async createEmployeeCustodyAccount(
    employee: Employee,
    amount: number,
    manager?: EntityManager,
  ): Promise<Transaction> {
    const accountRepository = manager
      ? manager.getRepository(Account)
      : this.accountRepository;
    const inventoryAccount = await accountRepository.findOne({ where: { name: 'الخزينه' } });
    if (!inventoryAccount) {
      throw new NotFoundException('Inventory account not found');
    }

    const availableBalance = await this.checkAvailableBalance(inventoryAccount.id, amount);
    if (!availableBalance) {
      throw new BadRequestException('Available balance is not enough');
    }

    const employeeName = buildPersonAccountName(
      employee.user?.firstName,
      employee.user?.lastName,
      `Employee ${employee.id}`,
    );
    const description = employee.user?.firstName || employee.user?.lastName
      ? `عهدة على الموظف ${employeeName}`
      : `عهدة على الموظف ${employee.id}`;

    const userCustodyAccount = await this.findPersonSubAccount(
      employeeName,
      ACCOUNT_PARENT_CUSTODY,
      manager,
    );

    const custodyLine = new TransactionLine();
    custodyLine.account = userCustodyAccount;
    custodyLine.amount = amount;
    custodyLine.entryType = EntryType.DEBIT;
    custodyLine.description = description;

    const inventoryLine = new TransactionLine();
    inventoryLine.account = inventoryAccount;
    inventoryLine.amount = amount;
    inventoryLine.entryType = EntryType.CREDIT;
    inventoryLine.description = description;

    const transaction = new Transaction();
    transaction.date = new Date();
    transaction.transactionLines = [custodyLine, inventoryLine];
    transaction.status = TransactionStatus.POSTED;
    transaction.description = description;

    return this.transactionService.save(transaction, undefined, manager);
  }


  async custodyMovement(
    accountFrom: Account,
    accountTo: Account,
    amount: number,
    manager?: EntityManager,
  ): Promise<Transaction> {
    const availableBalance = await this.checkAvailableBalance(accountFrom.id, amount);
    if (!availableBalance) {
      throw new BadRequestException('Available balance is not enough');
    }

    const custodyLineOut = new TransactionLine();
    custodyLineOut.account = accountFrom;
    custodyLineOut.amount = amount;
    custodyLineOut.entryType = EntryType.CREDIT;

    const custodyLineIn = new TransactionLine();
    custodyLineIn.account = accountTo;
    custodyLineIn.amount = amount;
    custodyLineIn.entryType = EntryType.DEBIT;

    const transaction = new Transaction();
    transaction.date = new Date();
    transaction.transactionLines = [custodyLineOut, custodyLineIn];
    transaction.status = TransactionStatus.POSTED;
    transaction.description = `عهده خارجيه من  ${accountFrom.name} الى ${accountTo.name}`;

    return this.transactionService.save(transaction, undefined, manager);
  }

  // balance = openingBalance + debitTotal - creditTotal;


  async getCurrentBalancesForAccounts(accountIds: number[]): Promise<Map<number, number>> {
    const uniqueIds = [...new Set(accountIds.filter((id) => id > 0))];
    const balances = new Map<number, number>();

    await Promise.all(
      uniqueIds.map(async (accountId) => {
        balances.set(accountId, await this.getCurrentBalance(accountId));
      }),
    );

    return balances;
  }

  async getCurrentBalance(accountId: number): Promise<number> {
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
    });

    if (!account) {
      throw new NotFoundException();
    }

    const debitTotal =
      (await this.transactionLineRepository.sum('amount', {
        account: { id: accountId },
        entryType: EntryType.DEBIT,
      })) ?? 0;

    const creditTotal =
      (await this.transactionLineRepository.sum('amount', {
        account: { id: accountId },
        entryType: EntryType.CREDIT,
      })) ?? 0;

    const opening = Number(account.openingBalance) || 0;

    if (account.normalBalance === normalBalanceType.DEBIT) {
      return opening + Number(debitTotal) - Number(creditTotal);
    }

    return opening + Number(creditTotal) - Number(debitTotal);
  }

  async checkAvailableBalance(
    accountId: number,
    amount: number,
  ): Promise<boolean> {
    const balance = await this.getCurrentBalance(accountId);

    return balance >= amount;
  }

  async validateCustodyFundingAvailable(amount: number): Promise<void> {
    const inventoryAccount = await this.accountRepository.findOne({ where: { name: 'الخزينه' } });
    if (!inventoryAccount) {
      throw new NotFoundException('Inventory account not found');
    }

    const availableBalance = await this.checkAvailableBalance(inventoryAccount.id, amount);
    if (!availableBalance) {
      throw new BadRequestException('Available balance is not enough');
    }
  }

  async findAccountForEmployee(employee: Employee): Promise<Account> {
    if (!employee.user) {
      throw new BadRequestException(`Employee ${employee.id} does not have an associated user`);
    }

    const accountName = buildPersonAccountName(
      employee.user.firstName,
      employee.user.lastName,
      `Employee ${employee.id}`,
    );

    return this.findPersonSubAccount(accountName, ACCOUNT_PARENT_CUSTODY);
  }

  async getEmployeeCustodyBalance(employee: Employee): Promise<{
    employeeId: number;
    accountId: number;
    accountName: string;
    custodyAmount: number;
  }> {
    const account = await this.findAccountForEmployee(employee);
    const custodyAmount = await this.getCurrentBalance(account.id);

    return {
      employeeId: employee.id,
      accountId: account.id,
      accountName: account.name,
      custodyAmount,
    };
  }
}
