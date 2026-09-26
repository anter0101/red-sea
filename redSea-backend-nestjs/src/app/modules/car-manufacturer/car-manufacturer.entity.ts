import { Column, Entity, OneToMany } from 'typeorm';
import { CarModel } from '../car-model/car-model.entity';
import { BaseEntity } from 'src/core/utils/base.entity';

@Entity('car_manufacturer')
export class CarManufacturer extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @OneToMany(() => CarModel, (carModel) => carModel.manufacturer)
  carModels: CarModel[];
}
