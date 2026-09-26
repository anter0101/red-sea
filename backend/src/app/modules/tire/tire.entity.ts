import { Entity, Column, ManyToOne } from 'typeorm';
import { Axle } from '../axle/axle.entity';
import { BaseEntity } from 'src/core/utils/base.entity';

@Entity('tires')
export class Tire extends BaseEntity {
  @Column({ type: 'varchar', length: 50 })
  serialNumber: string;

  @Column({ type: 'varchar', length: 20 })
  type: string;

  @Column({ type: 'varchar', length: 20 })
  healthPercentage: string; // e.g., NEW, USED, DAMAGED

  @Column({ type: 'varchar', length: 50 })
  location: string; // e.g., FRONT_LEFT, REAR_RIGHT

  @Column({ type: 'timestamp' })
  createdDate: Date;

  @ManyToOne(() => Axle, (axle) => axle.tires)
  axle: Axle;
}
