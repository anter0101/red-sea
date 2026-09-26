import { BaseEntity } from 'src/core/utils/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { SupplierType } from './enums/supplier-type.enum';
import { Government } from '../government/government.entity';

@Entity('suppliers')
export class Supplier extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  code: string; // كود المورد

  @Column({ type: 'varchar', length: 255 })
  name: string; // اسم المورد

  @Column({
    type: 'enum',
    enum: SupplierType,
    enumName: 'supplier_type_enum',
  })
  type: SupplierType; // نوع المورد (بضائع - خدمات - نقل)

  @ManyToOne(() => Government, { nullable: false, eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'government_id' })
  government: Government; // المحافظة

  @Column({ type: 'varchar', length: 20 })
  phone: string; // تليفون

  @Column({ type: 'varchar', length: 50 })
  commercialRegister: string; // سجل تجاري

  @Column({ type: 'varchar', length: 50 })
  taxCard: string; // بطاقة ضريبية

  @Column({ type: 'varchar', length: 50 })
  taxRegistrationNumber: string; // رقم التسجيل الضريبي
}
