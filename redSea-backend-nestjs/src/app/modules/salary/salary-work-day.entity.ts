import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from 'src/core/utils/base.entity';
import { Salary } from './salary.entity';

/** One recorded work day for a salary holder (internal calculation ledger). */
@Entity('salary_work_days')
export class SalaryWorkDay extends BaseEntity {
  @Index('IDX_salary_work_days_salary_id')
  @ManyToOne(() => Salary, (salary) => salary.workDays, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'salary_id' })
  salary: Salary;

  @Column({ type: 'date' })
  workDate: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;
}
