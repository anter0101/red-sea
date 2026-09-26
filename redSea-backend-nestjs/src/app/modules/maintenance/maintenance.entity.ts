import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from 'src/core/utils/base.entity';
import { Car } from '../car/car.entity';
import { Trailer } from '../trailer/trailer.entity';

@Entity('maintenances')
export class Maintenance extends BaseEntity {
  @Index('IDX_maintenances_car_id')
  @ManyToOne(() => Car, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'car_id' })
  car?: Car | null;

  @Index('IDX_maintenances_trailer_id')
  @ManyToOne(() => Trailer, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trailer_id' })
  trailer?: Trailer | null;

  @Column({ name: 'maintenance_date', type: 'date' })
  maintenanceDate: Date;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  cost?: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;
}
