import { SalaryType } from 'src/core/enums/salary';
import { BaseEntity } from 'src/core/utils/base.entity';
import { Entity, Column, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { SalaryWorkDay } from './salary-work-day.entity';
import { SalaryJourneyCommission } from './salary-journey-commission.entity';

@Entity('salaries')
export class Salary extends BaseEntity {
  @Column({ type: 'enum', enum: SalaryType, nullable: true })
  salaryType?: SalaryType;

  @Column({ type: 'decimal', nullable: true })
  salaryAmount?: number;

  /** Daily work price (شهري / كومسيون) */
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  dailyWorkPrice?: number;

  /** Commission per journey amount or % (شهري) */
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  commissionPerJourney?: number;

  /** Whether commissionPerJourney is a percentage (شهري) */
  @Column({ type: 'boolean', default: false, nullable: true })
  commissionIsPercentage?: boolean;

  /** % from nolon */
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  nolonPercent?: number;

  @OneToOne(() => User, (user) => user.salary, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  /** Internal work-day ledger (many rows; not configured on salary form) */
  @OneToMany(() => SalaryWorkDay, (row) => row.salary, { cascade: true })
  workDays?: SalaryWorkDay[];

  /** Internal per-journey commission ledger (many rows; not configured on salary form) */
  @OneToMany(() => SalaryJourneyCommission, (row) => row.salary, { cascade: true })
  journeyCommissions?: SalaryJourneyCommission[];
}
