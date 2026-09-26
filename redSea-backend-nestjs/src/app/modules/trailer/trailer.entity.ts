import { Entity, Column, Index, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from 'src/core/utils/base.entity';
import { TrailerAttachment } from '../trailer-attachment/trailer-attachment.entity';
import { PhysicalAttachment } from '../physical-attachment/physical-attachment.entity';
import { Axle } from '../axle/axle.entity';
import { OwnerShipType } from 'src/core/enums/ownerShip-types';
import { RelTrailerOwner } from '../rel-trailer-owner/rel-trailer-owner.entity';
import { VeachleStatus } from 'src/core/enums/veachle-status';

@Entity('trailers')
export class Trailer extends BaseEntity {
  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  chaseType?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  manufacturer?: string;

  @Column({ type: 'enum', enum: VeachleStatus, default: VeachleStatus.UNAVILABLE })
  status: VeachleStatus;

  @Column({ type: 'int', nullable: true })
  manufactureYear?: number;

  @Column({ type: 'varchar', length: 30, nullable: true })
  color?: string;

  @Column({ type: 'int', nullable: true })
  maxWeight?: number;

  @Column({ type: 'varchar', length: 20 })
  plateNumber: string;

  @Column({ type: 'varchar', length: 10 })
  plateLetters: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50, nullable: true })
  chassisNumber?: string;

  @Column({ type: 'varchar', length: 50 })
  licenseNumber: string;

  @Column({ type: 'date' })
  licenseExpiryDate: Date;

  @Column({ type: 'int', nullable: true })
  axleCount?: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ownerShip: OwnerShipType;

  @OneToMany(() => TrailerAttachment, (att) => att.trailer, {
    cascade: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  trailerAttachments?: TrailerAttachment[];

  @OneToMany(() => Axle, (axle) => axle.trailer, { cascade: true, eager: true })
  @JoinColumn()
  axles?: Axle[];

  @OneToMany(() => RelTrailerOwner, (rel) => rel.trailer, {
    cascade: true,
    eager: true,
  })
  Ownerships?: RelTrailerOwner[];

  @OneToMany(() => PhysicalAttachment, (attachment) => attachment.trailer, {
    cascade: true,
  })
  physicalAttachments?: PhysicalAttachment[];
}
