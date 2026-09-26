import { BaseEntity } from 'src/core/utils/base.entity';
import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';

@Entity('drivers')
export class Driver extends BaseEntity {
  @Column({ type: 'varchar', nullable: false })
  licenseNumber: string;

  @Column({ type: 'date', nullable: false })
  licenseExpiryDate: Date;

  @OneToOne(() => User, (user) => user.driver, { cascade: true, onDelete: 'CASCADE', eager: true })
  @JoinColumn()
  user: User;
}
