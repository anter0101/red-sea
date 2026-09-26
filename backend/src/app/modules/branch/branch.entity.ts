import { BaseEntity } from 'src/core/utils/base.entity';
import { Entity, Column, OneToMany } from 'typeorm';
import { Employee } from '../employee/employee.entity';

@Entity('branches')
export class Branch extends BaseEntity {
  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @OneToMany(() => Employee, (employee) => employee.branch)
  employees: Employee[];
}
