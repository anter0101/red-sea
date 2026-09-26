import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/core/utils/base.entity';
import { JourneyStatus } from 'src/core/enums/journey';
import { Journey } from './journey.entity';

@Entity('journey_status_events')
@Index('IDX_journey_status_events_journey_id', ['journey'])
export class JourneyStatusEvent extends BaseEntity {
  @ManyToOne(() => Journey, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'journey_id' })
  journey: Journey;

  @Column({ type: 'varchar', length: 50, nullable: true })
  fromStatus?: JourneyStatus | null;

  @Column({ type: 'varchar', length: 50, nullable: false })
  toStatus: JourneyStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  changedBy?: string;
}
