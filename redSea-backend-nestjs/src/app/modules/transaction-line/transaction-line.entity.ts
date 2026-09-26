import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from 'src/core/utils/base.entity';
import { Account } from '../account/account.entity';
import { Transaction } from '../transaction/transaction.entity';

export enum EntryType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

@Entity('transaction_lines')
export class TransactionLine extends BaseEntity {
  @ManyToOne(() => Transaction, (transaction: Transaction) => transaction.transactionLines, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'transaction_id' })
  transaction: Transaction;

  @ManyToOne(() => Account, (account) => account.transactionLines, { nullable: false, eager: true })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column({ type: 'enum', enum: EntryType })
  entryType: EntryType;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'text', nullable: true })
  description?: string;
}
