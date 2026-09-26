import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from 'src/core/utils/base.entity';
import { Car } from '../car/car.entity';
import { Trailer } from '../trailer/trailer.entity';

@Entity('physical_attachments')
export class PhysicalAttachment extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  photoUrl?: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  price?: number;

  @Column({ type: 'boolean', default: false })
  confirmedOk: boolean;

  @Column({ type: 'varchar', nullable: true })
  confirmedBy?: string;

  @Column({ type: 'timestamptz', nullable: true })
  confirmedAt?: Date;

  @Index('IDX_physical_attachments_car_id')
  @ManyToOne(() => Car, (car) => car.physicalAttachments, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'car_id' })
  car?: Car | null;

  @Index('IDX_physical_attachments_trailer_id')
  @ManyToOne(() => Trailer, (trailer) => trailer.physicalAttachments, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'trailer_id' })
  trailer?: Trailer | null;
}
