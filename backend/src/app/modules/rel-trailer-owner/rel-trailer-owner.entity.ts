// src/owner/entities/rel-trailer-owners.entity.ts
import { Entity, Column, ManyToOne, Index } from 'typeorm';
import { Trailer } from '../trailer/trailer.entity';
import { Owner } from '../owner/owner.entity';
import { BaseEntity } from 'src/core/utils/base.entity';

@Entity('rel_trailer_owners')
@Index(['trailer', 'owner'], { unique: true })
export class RelTrailerOwner extends BaseEntity {
  @ManyToOne(() => Owner, (owner) => owner.trailerOwnerships, {
    onDelete: 'CASCADE',
  })
  owner: Owner;

  @ManyToOne(() => Trailer, (trailer) => trailer.Ownerships, {
    onDelete: 'CASCADE',
  })
  trailer: Trailer;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 100.0,
  })
  percentage: number;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: 'Ownership contract URL' })
  contractUrl: string;

  @Column({ type: 'text', nullable: true, comment: 'Additional notes about ownership' })
  notes: string;
}
