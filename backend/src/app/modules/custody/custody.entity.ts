import { BaseEntity } from 'src/core/utils/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Employee } from '../employee/employee.entity';
import { Account } from '../account/account.entity';
import { CustodyStatus } from 'src/core/enums/custody-status';
import { Journey } from '../journey/journey.entity';
import { Driver } from '../driver/driver.entity';

@Entity('custodies')
export class Custody extends BaseEntity {
  @ManyToOne(() => Employee, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @ManyToOne(() => Account, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column({
    type: 'enum',
    enum: CustodyStatus,
    enumName: 'custody_status_enum',
    default: CustodyStatus.ACTIVE,
  })
  status: CustodyStatus;

  @ManyToOne(() => Journey, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'journey_id' })
  journey?: Journey | null;

  @ManyToOne(() => Driver, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'driver_id' })
  driver?: Driver | null;
}
