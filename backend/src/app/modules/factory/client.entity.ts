import { BaseEntity } from 'src/core/utils/base.entity';
import { Entity, Column, Index, OneToMany } from 'typeorm';
import { PricingSheetKind } from 'src/core/enums/pricing-sheet-kind';
import { DeliveryPrice } from '../delivery-price/delivery-price.entity';

@Entity('clients')
@Index(['name'], { unique: true })
export class Client extends BaseEntity {
  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  commercialRecord: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  taxInvoice?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  companyCode: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  destinationsFile?: string;

  @Column({ type: 'varchar', length: 20, nullable: false, default: PricingSheetKind.ARISH })
  pricingSheetKind: PricingSheetKind;

  @OneToMany(() => DeliveryPrice, (price) => price.client, { cascade: ['insert', 'update'] })
  prices?: DeliveryPrice[];
}
