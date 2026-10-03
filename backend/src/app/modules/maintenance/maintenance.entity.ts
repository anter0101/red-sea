import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from 'src/core/utils/base.entity';
import { MaintenanceType } from 'src/core/enums/maintenance-type';
import { Car } from '../car/car.entity';
import { Trailer } from '../trailer/trailer.entity';
import { TireSelection } from './tire-selection';

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

  @Column({ type: 'varchar', length: 32, default: MaintenanceType.GENERAL })
  type: MaintenanceType;

  @Column({ name: 'tire_selections', type: 'jsonb', nullable: true })
  tireSelections?: TireSelection[] | null;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  cost?: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;
}
