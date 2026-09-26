// src/journey-policy/journey-policy.entity.ts
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Journey } from '../journey/journey.entity';
import { Employee } from '../employee/employee.entity';
import { BaseEntity } from 'src/core/utils/base.entity';
import { Area } from '../area/area.entity';
import { Government } from '../government/government.entity';
import { IsDateString } from 'class-validator';

@Entity('journey_policies')
@Index('IDX_journey_policies_journey_id', ['journey'])
@Index('IDX_journey_policies_employee_id', ['employee'])
export class JourneyPolicy extends BaseEntity {
  @ManyToOne(() => Journey, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'journey_id' })
  journey: Journey;

  @Column({ type: 'float', nullable: true })
  bookWeight?: number;

  @Column({ type: 'float', nullable: true })
  actualWeight?: number;

  @Column({ type: 'float', nullable: true })
  deliveryWeight?: number;

  @Column({ type: 'float', nullable: true })
  shortageQty?: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  policyNo?: string;

  @Column({ type: 'date', nullable: true })
  policyDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  entryTimeFactory?: Date;

  @Column({ type: 'timestamp', nullable: true })
  exitTimeFactory?: Date;

  @ManyToOne(() => Government, { nullable: true })
  @JoinColumn({ name: 'delivery_gov_id' })
  deliveryGov?: Government;

  @ManyToOne(() => Area, { nullable: true })
  @JoinColumn({ name: 'delivery_area_id' })
  deliveryArea?: Area;

  @Column({ type: 'date', nullable: true })
  loadingDate?: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  loadingPermitNo?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  archiveNo?: string;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  // Total trip time in minutes
  @IsDateString()
  @Column({ type: 'date', nullable: true })
  tripDate?: Date;

  @Column({ type: 'float', name: 'trip_distance', nullable: true })
  tripDistance?: number;
}
