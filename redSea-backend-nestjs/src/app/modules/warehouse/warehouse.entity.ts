import { BaseEntity } from 'src/core/utils/base.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { ProductCondition, ProductStatus } from './warehouse.enums';
import { Supplier } from '../supplier/supplier.entity';

@Entity('warehouses')
@Index(['name'], { unique: true })
export class Warehouse extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  code: string; // كود المنتج

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string; // اسم منتج

  @Column({ type: 'varchar', length: 50, nullable: false })
  status: ProductStatus; // الحالة

  @Column({ type: 'varchar', length: 50, nullable: true })
  condition?: ProductCondition; // حالة المنتج

  @Column({ type: 'varchar', length: 100, nullable: false })
  category: string; // الفئة

  @Column({ type: 'int', nullable: false })
  quantity: number; // العدد

  @Column({ type: 'int', nullable: false })
  alertQuantity: number; // عدد التنبيه

  @Column({ type: 'varchar', length: 50, nullable: false })
  unit: string; // الوحدة

  @ManyToOne(() => Supplier, { nullable: false, eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier; // المورد

  @Column({ type: 'float', nullable: false })
  unitPrice: number; // سعر الوحدة

  @Column({ type: 'int', nullable: true })
  manufacturingYear?: number; // سنة الصنع

  @Column({ type: 'date', nullable: true })
  purchaseDate?: Date; // تاريخ الشراء

  @Column({ type: 'date', nullable: true })
  expiryDate?: Date; // تاريخ الصلاحية
}
