import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/core/utils/base.entity';
import { Client } from '../factory/client.entity';
import { Transaction } from '../transaction/transaction.entity';
import { InvoiceJourney } from './invoice-journey.entity';

@Entity('invoices')
@Index('IDX_invoices_client_id', ['client'])
export class Invoice extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @ManyToOne(() => Client, { nullable: false })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ type: 'date' })
  date: string;

  @Column({ name: 'tax_enabled', type: 'boolean', default: false })
  taxEnabled: boolean;

  @Column({ name: 'vat_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
  vatPercentage: number;

  @Column({ name: 'withholding_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
  withholdingPercentage: number;

  @Column({ name: 'total_revenue', type: 'decimal', precision: 14, scale: 2 })
  totalRevenue: number;

  @Column({ name: 'vat_amount', type: 'decimal', precision: 14, scale: 2 })
  vatAmount: number;

  @Column({ name: 'withholding_amount', type: 'decimal', precision: 14, scale: 2 })
  withholdingAmount: number;

  @Column({ name: 'net_amount', type: 'decimal', precision: 14, scale: 2 })
  netAmount: number;

  @ManyToOne(() => Transaction, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'transaction_id' })
  transaction?: Transaction | null;

  @OneToMany(() => InvoiceJourney, (row) => row.invoice)
  journeys?: InvoiceJourney[];

  /** Filled by the list query. Not a column. */
  journeyCount?: number;
}
