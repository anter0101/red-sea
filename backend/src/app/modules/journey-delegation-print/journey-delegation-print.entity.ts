import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from 'src/core/utils/base.entity';
import { JourneyDelegationPrintStatus } from 'src/core/enums/journey-delegation-print';
import { Journey } from '../journey/journey.entity';

@Entity('journey_delegation_prints')
export class JourneyDelegationPrint extends BaseEntity {
  @OneToOne(() => Journey, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'journey_id' })
  journey: Journey;

  @Column({
    type: 'enum',
    enum: JourneyDelegationPrintStatus,
    default: JourneyDelegationPrintStatus.NOT_PRINTED,
  })
  status: JourneyDelegationPrintStatus;
}
