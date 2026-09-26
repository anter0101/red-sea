import { BaseEntity } from 'src/core/utils/base.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { Client } from '../factory/client.entity';
import { Area } from '../area/area.entity';
import { PriceType } from '../price-type/price-type.entity';

@Entity('delivery_prices')
@Unique(['client', 'area', 'priceType', 'validFrom'])
@Index(['client', 'area', 'validFrom', 'validTo'])
export class DeliveryPrice extends BaseEntity {
  @ManyToOne(() => Client, (client) => client.prices, { nullable: false })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @ManyToOne(() => Area, (area) => (area as any).prices, { nullable: false })
  @JoinColumn({ name: 'area_id' })
  area: Area;

  @ManyToOne(() => PriceType, { nullable: true })
  @JoinColumn({ name: 'price_type_id' })
  priceType?: PriceType;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  basePrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  additionalFees: number = 0;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxPrice: number = 0;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalPrice?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, default: 0 })
  nolonPrice?: number;

  /** Fixed trip pay for employees on NOLON_PERCENT salary (not for NOLON/CONTRACT car nolonPrice). */
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, default: 0 })
  employeeNolonAmount?: number;

  @Column({ type: 'date' })
  validFrom: Date;

  @Column({ type: 'date' })
  validTo: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;
}
