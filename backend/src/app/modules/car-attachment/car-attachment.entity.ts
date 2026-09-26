import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from 'src/core/utils/base.entity';
import { Car } from '../car/car.entity';
import { CarAttachmentType } from 'src/core/enums/car-attachment-types';

@Entity('car_attachments')
export class CarAttachment extends BaseEntity {
  @Index('IDX_car_attachments_car_id')
  @ManyToOne(() => Car, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'car_id' })
  car: Car;

  @Column({ type: 'enum', enum: CarAttachmentType })
  type: CarAttachmentType;

  // Refactored field name
  @Column({ type: 'date', nullable: true })
  documentExpiryDate: Date;

  @Column({ type: 'varchar', length: 255 })
  url: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;
}
