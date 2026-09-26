import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from 'src/core/utils/base.entity';
import { Salary } from './salary.entity';

/** One recorded commission for a journey (internal calculation ledger). */
@Entity('salary_journey_commissions')
export class SalaryJourneyCommission extends BaseEntity {
  @Index('IDX_salary_journey_commissions_salary_id')
  @ManyToOne(() => Salary, (salary) => salary.journeyCommissions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'salary_id' })
  salary: Salary;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'date', nullable: true })
  commissionDate?: Date;

  /** Optional link to journey once payroll calc wires it up */
  @Column({ type: 'int', nullable: true })
  journeyId?: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;
}
