import { BaseEntity } from 'src/core/utils/base.entity';
import { Entity, Index, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';
import { Branch } from '../branch/branch.entity';

@Entity('employees')
@Index('IDX_employees_branch_id', ['branch'])
export class Employee extends BaseEntity {
  @OneToOne(() => User, (user) => user.employee, {
    cascade: true,
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Branch, (branch) => branch.employees)
  branch: Branch;
}
