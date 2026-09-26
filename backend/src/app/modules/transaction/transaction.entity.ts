import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/core/utils/base.entity';
import { TransactionLine } from '../transaction-line/transaction-line.entity';

export enum TransactionStatus {
  DRAFT = 'DRAFT',
  POSTED = 'POSTED',
  CANCELLED = 'CANCELLED',
}

@Entity('transactions')
export class Transaction extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.DRAFT,
  })
  status: TransactionStatus;

  @Column({ name: 'idempotency_key', type: 'varchar', length: 120, nullable: true, unique: true })
  idempotencyKey?: string | null;

  @OneToMany(() => TransactionLine, (line) => line.transaction, { cascade: true })
  transactionLines?: TransactionLine[];
}
