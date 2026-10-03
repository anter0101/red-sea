import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from 'src/core/utils/base.entity';
import { PhysicalAttachment } from './physical-attachment.entity';

@Entity('physical_attachment_checks')
export class PhysicalAttachmentCheck extends BaseEntity {
  @Index('IDX_physical_attachment_checks_attachment_id')
  @ManyToOne(() => PhysicalAttachment, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'physical_attachment_id' })
  attachment: PhysicalAttachment;

  @Column({ type: 'varchar', length: 255, nullable: true })
  label?: string | null;

  @Column({ type: 'boolean' })
  checked: boolean;

  @Column({ name: 'sortOrder', type: 'int', nullable: true })
  sortOrder?: number | null;

  @Column({ name: 'recorded_at', type: 'timestamptz' })
  recordedAt: Date;

  @Column({ name: 'recorded_by', type: 'varchar' })
  recordedBy: string;
}
