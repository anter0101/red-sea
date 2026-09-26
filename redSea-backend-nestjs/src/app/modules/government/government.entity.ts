import { BaseEntity } from 'src/core/utils/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Area } from '../area/area.entity';

@Entity('governments')
export class Government extends BaseEntity {
  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @OneToMany(() => Area, (area) => area.government)
  areas?: Area[];
}
