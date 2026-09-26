import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/core/utils/base.entity';
import { User } from '../user/user.entity';

@Entity('grids')
export class Grids extends BaseEntity {
  @Column({ name: 'page_key', type: 'text' })
  pageKey: string;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  columns: any[];

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
