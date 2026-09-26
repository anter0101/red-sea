import { Column, Entity, JoinColumn, OneToMany, Tree, TreeChildren, TreeParent } from 'typeorm';
import { BaseEntity } from 'src/core/utils/base.entity';
import { TransactionLine } from '../transaction-line/transaction-line.entity';

export enum AccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE',
  CASH = 'CASH',
}

export enum normalBalanceType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

/**
 * Chart of accounts — TypeORM tree entity (`@Tree('adjacency-list')`, FK `parent_account_id`).
 * - type / normalBalance: enforced to match parent when a parent exists (see AccountService).
 * - isLeaf: maintained by the service; postings use leaf accounts only (see journal validation).
 * - isSystem: seeded chart rows are read-only via the API (no update/delete).
 * - openingBalance: starting position before posted activity (reports); set once then locked.
 * - Stored balances for postings roll up from transaction_lines on leaf accounts in reports.
 */
@Entity('accounts')
@Tree('adjacency-list')
export class Account extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({
    type: 'enum',
    enum: AccountType,
  })
  type: AccountType;

  @Column({
    type: 'enum',
    enum: normalBalanceType,
  })
  normalBalance: normalBalanceType;

  @TreeParent({ onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parent_account_id' })
  parentAccount?: Account;

  @TreeChildren()
  childAccounts?: Account[];

  @Column({ type: 'boolean', default: false })
  isLeaf: boolean;

  @Column({ type: 'boolean', default: false })
  isSystem: boolean;

  @Column({
    name: 'opening_balance',
    type: 'decimal',
    precision: 14,
    scale: 2,
    default: 0,
  })
  openingBalance: number;

  @Column({ name: 'opening_balance_locked', type: 'boolean', default: false })
  openingBalanceLocked: boolean;

  @OneToMany(() => TransactionLine, (line: TransactionLine) => line.account)
  transactionLines?: TransactionLine[];
}
