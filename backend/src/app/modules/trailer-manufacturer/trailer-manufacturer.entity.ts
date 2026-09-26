import { Column, Entity } from 'typeorm';
import { BaseEntity } from 'src/core/utils/base.entity';

@Entity('trailer_manufacturer')
export class TrailerManufacturer extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;
}
