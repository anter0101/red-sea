import { Entity, Column, Index, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from 'src/core/utils/base.entity';
import { CarAttachment } from '../car-attachment/car-attachment.entity';
import { PhysicalAttachment } from '../physical-attachment/physical-attachment.entity';
import { Axle } from '../axle/axle.entity';
import { OwnerShipType } from 'src/core/enums/ownerShip-types';
import { RelCarOwner } from '../rel-car-owner/rel-car-owner.entity';
import { VeachleStatus } from 'src/core/enums/veachle-status';

@Entity('cars')
export class Car extends BaseEntity {
  @Column({ type: 'varchar', length: 50 })
  code: string;

  // Manufacturer brand (Mercedes, BMW, Toyota...)
  @Column({ type: 'varchar', length: 100, nullable: true })
  manufacturer: string;

  // Active / Inactive status
  @Column({ type: 'enum', enum: VeachleStatus, default: VeachleStatus.AVILABLE })
  status: VeachleStatus;

  // Car model (X5, Actros, Track 123...)
  @Column({ type: 'varchar', length: 100, nullable: true })
  model: string;

  // Manufacturing year
  @Column({ type: 'int', nullable: true })
  manufactureYear: number;

  // Car color
  @Column({ type: 'varchar', length: 30, nullable: true })
  color: string;

  // Number of cylinders
  @Column({ type: 'int', nullable: true })
  cylinders: number;

  // Engine horsepower
  @Column({ type: 'int', nullable: true })
  horsepower: number;

  // Number of axles (2, 3, 4...)
  @Column({ type: 'int', name: 'axleCount', nullable: true })
  axleCount: number;

  // Maximum weight in KG or tons (your choice)
  @Column({ type: 'int', nullable: true })
  maxWeight: number;

  // Car license plate number
  @Column({ type: 'varchar', length: 20 })
  plateNumber: string;

  // Car license plate letters (ABC, DEF...)
  @Column({ type: 'varchar', length: 10 })
  plateLetters: string;

  // Chassis number / VIN
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50, nullable: true })
  chassisNumber: string;

  // Car license number
  @Column({ type: 'varchar', length: 50 })
  licenseNumber: string;

  // License expiration date
  @Column({ type: 'date' })
  licenseExpiryDate: Date;

  // Additional notes
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ownerShip: OwnerShipType;

  @OneToMany(() => CarAttachment, (carAttachment) => carAttachment, {
    cascade: true,
    onDelete: 'CASCADE',
    eager: true,
  })
  // Car attachments
  @OneToMany(() => CarAttachment, (carAttachment) => carAttachment.car, {
    cascade: true,
    eager: true,
  })
  carAttachments?: CarAttachment[];

  // Car Axles
  @OneToMany(() => Axle, (axle) => axle.car, { cascade: true, eager: true })
  @JoinColumn()
  axles?: Axle[];

  @OneToMany(() => RelCarOwner, (rel) => rel.car, {
    cascade: true,
    eager: true,
  })
  Ownerships?: RelCarOwner[];

  @OneToMany(() => PhysicalAttachment, (attachment) => attachment.car, {
    cascade: true,
  })
  physicalAttachments?: PhysicalAttachment[];
}
