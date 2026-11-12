import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/core/utils/base.entity';
import { Driver } from '../driver/driver.entity';
import { Car } from '../car/car.entity';
import { Trailer } from '../trailer/trailer.entity';
import { User } from '../user/user.entity';
import { JourneyStatus } from 'src/core/enums/journey';
import { Client } from '../factory/client.entity';
import { Area } from '../area/area.entity';
import { Government } from '../government/government.entity';
import { Employee } from '../employee/employee.entity';
import { Supplier } from '../supplier/supplier.entity';
import { JourneyPolicy } from '../journey-goods/journey-policy.entity';
import { JourneyTransaction } from '../journey-transaction/journey-transaction.entity';
import { PackingType } from 'src/core/enums/packing-type';

@Entity('journeys')
@Index('IDX_journeys_driver_id', ['driver'])
@Index('IDX_journeys_car_id', ['car'])
@Index('IDX_journeys_trailer_id', ['trailer'])
@Index('IDX_journeys_client_id', ['client'])
@Index('IDX_journeys_assistant_id', ['assistant'])
@Index('IDX_journeys_custody_source_id', ['custodySource'])
@Index('IDX_journeys_trip_status_created_at', ['tripStatus', 'createdAt'])
export class Journey extends BaseEntity {
  @Column({ type: 'varchar', length: 50, nullable: true })
  delegateNumber?: string;

  @Column({ type: 'date', nullable: true })
  delegateDate?: Date;

  @Column({ type: 'varchar', length: 50, nullable: false })
  tripStatus: JourneyStatus;

  @ManyToOne(() => Driver, { nullable: false, eager: true })
  @JoinColumn({ name: 'driver_id' })
  driver: Driver;

  @ManyToOne(() => User, { nullable: true, eager: true })
  @JoinColumn({ name: 'assistant_id' })
  assistant?: User;

  @ManyToOne(() => Car, { nullable: false, eager: true })
  @JoinColumn({ name: 'car_id' })
  car: Car;

  @ManyToOne(() => Client, { nullable: false, eager: true })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @ManyToOne(() => Trailer, { nullable: false, eager: true })
  @JoinColumn({ name: 'trailer_id' })
  trailer: Trailer;

  @Column({ type: 'varchar', length: 255, nullable: true })
  direction?: string; // الجهة

  @Column({ type: 'float', nullable: true })
  quantity?: number; // الكمية

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  expectedRevenue?: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  actualRevenue?: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  cementGrade?: string; // رتبة الاسمنت

  @Column({ type: 'varchar', length: 50, nullable: true })
  packingType?: PackingType; // نوع التعبئة

  @Column({ type: 'varchar', length: 100, nullable: true })
  sellingOrderNo?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  receivedCompany?: string;

  @ManyToOne(() => Employee, { nullable: true, eager: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'custody_source_id' })
  custodySource?: Employee; // Source of custody

  @ManyToOne(() => Area, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'delivery_area_id' })
  deliveryArea?: Area;

  @ManyToOne(() => Government, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'delivery_gov_id' })
  deliveryGov?: Government;

  @ManyToOne(() => Supplier, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'transport_supplier_id' })
  transportSupplier?: Supplier;

  @OneToMany(() => JourneyPolicy, (policy) => policy.journey)
  journeyPolicies?: JourneyPolicy[];

  @OneToMany(() => JourneyTransaction, (transaction) => transaction.journey)
  journeyTransactions?: JourneyTransaction[];
}
