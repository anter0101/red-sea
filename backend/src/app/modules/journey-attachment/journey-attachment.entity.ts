import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/core/utils/base.entity';
import { Journey } from '../journey/journey.entity';
import { JourneyAttachmentType } from 'src/core/enums/journey';

@Entity('journey_attachments')
export class JourneyAttachment extends BaseEntity {
  @Index('IDX_journey_attachments_journey_id')
  @ManyToOne(() => Journey, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'journey_id' })
  journey: Journey;

  @Column({ type: 'varchar', length: 100, nullable: true })
  type: JourneyAttachmentType;

  @Column({ type: 'varchar', length: 100, nullable: true })
  url: string;
}
