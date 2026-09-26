import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/core/utils/base.entity';
import { OfficeRequestStatus, OfficeRequestType } from 'src/core/enums/office-request';
import { Journey } from '../journey/journey.entity';
import { Employee } from '../employee/employee.entity';

@Entity('office_requests')
export class OfficeRequest extends BaseEntity {
  @Column({ type: 'enum', enum: OfficeRequestStatus, default: OfficeRequestStatus.PENDING })
  status: OfficeRequestStatus;

  @Column({ type: 'enum', enum: OfficeRequestType })
  type: OfficeRequestType;

  @ManyToOne(() => Journey, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'journey_id' })
  journey?: Journey;

  @ManyToOne(() => Employee, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'requested_from_id' })
  requestedFrom: Employee;

  @ManyToOne(() => Employee, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'requested_to_id' })
  requestedTo: Employee;

  @Column({ type: 'text', nullable: true })
  description?: string;
}
