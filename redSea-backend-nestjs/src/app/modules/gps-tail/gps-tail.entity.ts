import { BaseEntity } from 'src/core/utils/base.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { GpsDevice } from '../gps-device/gps-device.entity';

@Entity('gps_tails')
export class GpsTail extends BaseEntity {
  @ManyToOne(() => GpsDevice, (device) => device.gpsTail, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'device_id' })
  gpsDevice: GpsDevice;

  @Column({ type: 'double precision', nullable: false })
  latitude: number;

  @Column({ type: 'double precision', nullable: false })
  longitude: number;

  @Column({ type: 'int', nullable: false })
  sequenceOrder: number;

  @Column({ type: 'timestamp without time zone', nullable: false })
  timestamp: Date;
}
