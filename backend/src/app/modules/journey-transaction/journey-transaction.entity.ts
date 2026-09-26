import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/core/utils/base.entity';
import { Journey } from '../journey/journey.entity';
import { JourneyTransactionCategoryType, JourneyTransactionType } from 'src/core/enums/journey';

@Entity('journey_transactions')
export class JourneyTransaction extends BaseEntity {
  @Index('uniq_journey_category', ['journey', 'category'])
  @ManyToOne(() => Journey, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'journey_id' })
  journey: Journey;

  @Column({ type: 'enum', enum: JourneyTransactionType })
  transactionType: JourneyTransactionType;

  @Column({ type: 'enum', enum: JourneyTransactionCategoryType })
  category: JourneyTransactionCategoryType;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'float', nullable: true })
  quantity?: number; // liters, count, etc.

  @Column({ type: 'float', nullable: true })
  unitPrice?: number;

  @Column({ type: 'varchar', length: 150, nullable: true })
  placeOrService?: string; // gas station, toll place

  @Column({ type: 'text', nullable: true })
  invoiceUrl?: string;

  @Column({ type: 'float' })
  amount: number;
}
