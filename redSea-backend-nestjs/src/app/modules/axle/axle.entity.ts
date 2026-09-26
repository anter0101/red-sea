import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from 'src/core/utils/base.entity';
import { Car } from '../car/car.entity';
import { Trailer } from '../trailer/trailer.entity';
import { Tire } from '../tire/tire.entity';

@Entity('axles')
export class Axle extends BaseEntity {
  @Column({ type: 'int' })
  number: number;

  // Many-to-One with Car
  @ManyToOne(() => Car, (car) => car.axles, { nullable: true })
  @JoinColumn({ name: 'carId' })
  car?: Car;

  // Many-to-One with Trailer
  @ManyToOne(() => Trailer, (trailer) => trailer.axles, { nullable: true })
  @JoinColumn({ name: 'trailerId' })
  trailer?: Trailer;

  // One-to-Many with Tires
  @OneToMany(() => Tire, (tire) => tire.axle, { cascade: true })
  tires?: Tire[];
}
