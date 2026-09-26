import { Entity, Column, OneToMany, OneToOne } from 'typeorm';
import { Exclude } from 'class-transformer';
import { BaseEntity } from 'src/core/utils/base.entity';
import { UserRole } from 'src/core/enums/user-role';
import { Contact } from '../contact/contact.entity';
import { Driver } from '../driver/driver.entity';
import { Salary } from '../salary/salary.entity';
import { UserStatus } from 'src/core/enums/user-status';
import { Employee } from '../employee/employee.entity';
import { UserAttachment } from '../user-attachment/user-attachment.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  email?: string;

  @Exclude()
  @Column({ type: 'varchar', length: 255, nullable: true })
  password?: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  username: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    nullable: false,
    default: UserStatus.AVAILABLE,
  })
  status: UserStatus;

  @Column({ type: 'boolean', default: false, nullable: true })
  activated?: boolean;

  @Column({ name: 'image_url', type: 'varchar', length: 255, nullable: true })
  imageUrl?: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ name: 'first_name', type: 'varchar', length: 100, nullable: true })
  firstName?: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100, nullable: true })
  lastName?: string;

  @Column({ name: 'personal_id', type: 'varchar', length: 50, nullable: true })
  personalId?: string;

  @Column({ name: 'personal_id_expiry_date', type: 'date', nullable: true })
  personalIdExpiryDate?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  notes?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  code?: string;

  /** Relations **/
  @OneToMany(() => Contact, (contact) => contact.user)
  contacts?: Contact[];

  @OneToMany(() => UserAttachment, (attachment) => attachment.user)
  userAttachments?: UserAttachment[];

  @OneToOne(() => Salary, (salary) => salary.user)
  salary?: Salary;

  @OneToOne(() => Driver, (driver) => driver.user)
  driver?: Driver;

  @OneToOne(() => Employee, (employee) => employee.user)
  employee: Employee;
}
