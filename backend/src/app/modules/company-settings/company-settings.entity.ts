import { Column, Entity } from 'typeorm';
import { BaseEntity } from 'src/core/utils/base.entity';

@Entity('company_settings')
export class CompanySettings extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'tax_card', type: 'varchar', length: 50 })
  taxCard: string;

  @Column({ name: 'commercial_register', type: 'varchar', length: 50 })
  commercialRegister: string;
}
