import { Column, Entity, ManyToOne } from 'typeorm';
import { CarManufacturer } from '../car-manufacturer/car-manufacturer.entity';
import { BaseEntity } from 'src/core/utils/base.entity';

@Entity('car_model')
export class CarModel extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @ManyToOne(() => CarManufacturer, (manufacturer) => manufacturer.carModels, {
    eager: true,
    onDelete: 'CASCADE',
  })
  manufacturer: CarManufacturer;
}
