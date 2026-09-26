import { BaseEntity } from 'src/core/utils/base.entity';
import { Entity, Column, Index, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { GpsTail } from '../gps-tail/gps-tail.entity';
import { Car } from '../car/car.entity';

@Entity('gps_devices')
@Index(['imei'], { unique: true })
export class GpsDevice extends BaseEntity {
  @Column({ type: 'varchar', length: 150, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  imei: string;

  @Column({ type: 'double precision', nullable: true })
  lastLatitude?: number;

  @Column({ type: 'double precision', nullable: true })
  lastLongitude?: number;

  @Column({ type: 'double precision', nullable: true })
  speed?: number;

  @Column({ type: 'double precision', nullable: true })
  totalDistance?: number;

  @Column({ type: 'double precision', nullable: true })
  batteryLevel?: number;

  @Column({ type: 'double precision', nullable: true })
  signalStrength?: number;

  @Column({ type: 'boolean', default: false })
  engineStatus?: boolean = false;

  @Column({ type: 'timestamp without time zone', nullable: true })
  lastUpdate?: Date;

  @OneToMany(() => GpsTail, (tail) => tail.gpsDevice, {
    cascade: true, // Enables cascading inserts/updates
  })
  gpsTail?: GpsTail[];

  @OneToOne(() => Car, { nullable: true })
  @JoinColumn({ name: 'carId' })
  car: Car | null;
}
