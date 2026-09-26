import { Column, Entity } from 'typeorm';
import { BaseEntity } from 'src/core/utils/base.entity';

@Entity('tire_model')
export class TireModel extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;
}
