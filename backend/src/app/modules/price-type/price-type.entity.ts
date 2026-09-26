import { PackingType } from 'src/core/enums/packing-type';
import { BaseEntity } from 'src/core/utils/base.entity';
import { Column, Entity, Index } from 'typeorm';

@Entity('price_types')
@Index(['name'], { unique: true })
export class PriceType extends BaseEntity {
  @Column({ type: 'varchar', length: 100, nullable: false })
  name: PackingType; // e.g., "معبأ"

  @Column({ type: 'text', nullable: true })
  description?: string;
}
