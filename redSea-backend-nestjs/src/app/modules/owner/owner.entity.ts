// src/owner/owner.entity.ts
import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/core/utils/base.entity';
import { RelCarOwner } from '../rel-car-owner/rel-car-owner.entity';
import { RelTrailerOwner } from '../rel-trailer-owner/rel-trailer-owner.entity';
import { transactionType } from 'src/core/enums/transaction-types';

@Entity('owners')
export class Owner extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({
    type: 'enum',
    enum: transactionType,
    default: transactionType.BANK,
  })
  transactionType: transactionType;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  paymentNumber: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'varchar', length: 34, nullable: true })
  bankAccountNumber: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  bankName: string;

  @OneToMany(() => RelCarOwner, (rel) => rel.owner, { cascade: true })
  carOwnerships: RelCarOwner[];

  @OneToMany(() => RelTrailerOwner, (rel) => rel.owner, { cascade: true })
  trailerOwnerships: RelTrailerOwner[];
}
