import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from 'src/core/utils/base.entity';
import { User } from '../user/user.entity';
import { UserAttachmentType } from 'src/core/enums/user-attachment-types';

@Entity('user_attachments')
export class UserAttachment extends BaseEntity {
  @Index('IDX_user_attachments_user_id')
  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 255 })
  url: string;

  @Column({ type: 'enum', enum: UserAttachmentType })
  type: UserAttachmentType;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'date', nullable: true })
  documentExpiryDate: Date;
}
