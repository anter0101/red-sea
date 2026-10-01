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
}
