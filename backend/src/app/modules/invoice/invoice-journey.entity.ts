import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/core/utils/base.entity';
import { Journey } from '../journey/journey.entity';
import { Invoice } from './invoice.entity';

@Entity('invoice_journeys')
@Index('UQ_invoice_journeys_journey', ['journey'], { unique: true })
export class InvoiceJourney extends BaseEntity {
  @ManyToOne(() => Invoice, (invoice) => invoice.journeys, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;

  @ManyToOne(() => Journey, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'journey_id' })
  journey: Journey;

  @Column({ name: 'revenue_amount', type: 'decimal', precision: 14, scale: 2 })
  revenueAmount: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  governorate?: string | null;

  @Column({ name: 'received_company', type: 'varchar', length: 255, nullable: true })
  receivedCompany?: string | null;

  @Column({ name: 'packing_type', type: 'varchar', length: 50, nullable: true })
  packingType?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  destination?: string | null;

  @Column({ name: 'journey_date', type: 'date', nullable: true })
  journeyDate?: string | null;

  @Column({ type: 'decimal', precision: 14, scale: 4, nullable: true })
  quantity?: number | null;

  @Column({ name: 'unit_price', type: 'decimal', precision: 14, scale: 2, nullable: true })
  unitPrice?: number | null;
}
