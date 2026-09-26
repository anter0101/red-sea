// src/owner/entities/rel-car-owners.entity.ts
import { Entity, Column, ManyToOne, Index } from 'typeorm';
import { BaseEntity } from 'src/core/utils/base.entity';
import { Owner } from '../owner/owner.entity';
import { Car } from '../car/car.entity';

@Entity('rel_car_owners')
@Index(['car', 'owner'], { unique: true }) // Prevent duplicate ownership records
export class RelCarOwner extends BaseEntity {
  @ManyToOne(() => Owner, (owner) => owner.carOwnerships, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  owner: Owner;

  @ManyToOne(() => Car, (car) => car.Ownerships, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  car: Car;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 100.0,
    comment: 'Ownership percentage (0.00 - 100.00)',
  })
  percentage: number;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: 'Ownership contract URL' })
  contractUrl: string;

  @Column({ type: 'text', nullable: true, comment: 'Additional notes about ownership' })
  notes: string;
}
