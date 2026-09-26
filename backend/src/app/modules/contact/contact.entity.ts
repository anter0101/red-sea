import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/core/utils/base.entity';
import { User } from '../user/user.entity';

@Entity('contacts')
export class Contact extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  phone: string;

  @Column({ type: 'boolean', default: false })
  isPrimary?: boolean;
  @ManyToOne(() => User, (user) => user.contacts, { onDelete: 'CASCADE' })
  user: User;
}
