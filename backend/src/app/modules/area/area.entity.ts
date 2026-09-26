import { BaseEntity } from 'src/core/utils/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Government } from '../government/government.entity';
import { DeliveryPrice } from '../delivery-price/delivery-price.entity';

@Entity('areas')
export class Area extends BaseEntity {
  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @ManyToOne(() => Government, (government) => government.areas, {
    nullable: false,
    onDelete: 'RESTRICT',
    eager: true,
  })
  @JoinColumn({ name: 'government_id' })
  government: Government;

  @OneToMany(() => DeliveryPrice, (price) => price.area)
  prices?: DeliveryPrice[];
}
