import { Injectable, BadRequestException, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, FindOneOptions, Between, EntityManager } from 'typeorm';
import { Transaction, TransactionStatus } from './transaction.entity';
import { QueryTransactionDTO } from './dtos/query-transaction.dto';
import { generateUniqueCode } from 'src/core/utils/generator';
import { GeneratorTypes } from 'src/core/enums/generator-types';
import { EntryType } from '../transaction-line/transaction-line.entity';
import { AccountService } from '../account/account.service';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @Inject(forwardRef(() => AccountService))
    private readonly accountService: AccountService,
  ) {}

  async findById(id: number): Promise<Transaction | undefined> {
    const result = await this.transactionRepository.findOne({
      where: { id },
      relations: ['transactionLines', 'transactionLines.account'],
    });
    return result || undefined;
  }

  async findByFields(options: FindOneOptions<Transaction>): Promise<Transaction | undefined> {
    const result = await this.transactionRepository.findOne(options);
    return result || undefined;
  }

  async find(options: FindManyOptions<Transaction>): Promise<Transaction[]> {
    return await this.transactionRepository.find(options);
  }

  async findAndCount(query: QueryTransactionDTO): Promise<[Transaction[], number]> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;

    const options: FindManyOptions<Transaction> = {
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: query.sortField ? { [query.sortField]: query.sortOrder || 'ASC' } : { id: 'DESC' },
      where: {},
      relations: ['transactionLines', 'transactionLines.account'],
    };

    if (query.status) {
      options.where = { ...options.where, status: query.status };
    }

    if (query.dateFrom && query.dateTo) {
      options.where = {
        ...options.where,
        date: Between(new Date(query.dateFrom), new Date(query.dateTo)),
      };
    } else if (query.dateFrom) {
      options.where = {
        ...options.where,
        date: Between(new Date(query.dateFrom), new Date('9999-12-31')),
      };
    } else if (query.dateTo) {
      options.where = {
        ...options.where,
        date: Between(new Date('1900-01-01'), new Date(query.dateTo)),
      };
    }

    return this.transactionRepository.findAndCount(options);
  }

  async save(
    transaction: Transaction,
    creator?: string,
    manager?: EntityManager,
  ): Promise<Transaction> {
    const repo = manager ? manager.getRepository(Transaction) : this.transactionRepository;
    const now = new Date();

    transaction.createdAt = transaction.createdAt ?? now;
    transaction.updatedAt = now;

    if (creator) {
      transaction.createdBy = transaction.createdBy ?? creator;
      transaction.updatedBy = creator;
    }

    transaction.code = await generateUniqueCode(repo, GeneratorTypes.TRANSACTION);

    // Validate transaction before saving
    this.validateTransaction(transaction);

    const saved = await repo.save(transaction);
    await this.accountService.lockOpeningBalancesAfterJournalActivity(saved, manager);
    return saved;
  }

  async update(transaction: Transaction, updater?: string): Promise<Transaction> {
    const now = new Date();
    transaction.updatedAt = now;
    if (updater) transaction.updatedBy = updater;

    // Guard against modifying already-POSTED or CANCELLED transactions.
    // Re-fetch the persisted status so the check runs against the DB value,
    // not the new value that the mapper has already applied to the entity.
    const persisted = await this.transactionRepository.findOne({ where: { id: transaction.id } });
    if (
      persisted &&
      (persisted.status === TransactionStatus.POSTED ||
        persisted.status === TransactionStatus.CANCELLED)
    ) {
      throw new BadRequestException(`Cannot modify transaction with status ${persisted.status}`);
    }

    // Validate transaction before updating
    this.validateTransaction(transaction);

    return await this.transactionRepository.save(transaction);
  }

  async delete(id: number): Promise<void> {
    await this.transactionRepository.delete(id);
  }

  private validateTransaction(transaction: Transaction): void {
    // Validate minimum two transaction lines
    if (!transaction.transactionLines || transaction.transactionLines.length < 2) {
      throw new BadRequestException('Transaction must contain at least two transaction lines');
    }

    // Validate balanced transaction when status is POSTED
    const totalDebits = transaction.transactionLines.reduce(
      (sum, line) => sum + (line.entryType === EntryType.DEBIT ? line.amount : 0),
      0,
    );
    const totalCredits = transaction.transactionLines.reduce(
      (sum, line) => sum + (line.entryType === EntryType.CREDIT ? line.amount : 0),
      0,
    );

    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      throw new BadRequestException('Transaction is not balanced: debits must equal credits');
    }
  }
}
