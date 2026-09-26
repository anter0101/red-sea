// src/trailer-attachment/trailer-attachment.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from 'src/core/utils/base.entity';
import { Trailer } from '../trailer/trailer.entity';
import { TrailerAttachmentType } from 'src/core/enums/trailer-attachment-types';

@Entity('trailer_attachments')
export class TrailerAttachment extends BaseEntity {
  @Index('IDX_trailer_attachments_trailer_id')
  @ManyToOne(() => Trailer, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trailer_id' })
  trailer: Trailer;

  @Column({ type: 'enum', enum: TrailerAttachmentType })
  type: TrailerAttachmentType;

  @Column({ type: 'date', nullable: true })
  documentExpiryDate: Date;

  @Column({ type: 'varchar', length: 255 })
  url: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;
}
