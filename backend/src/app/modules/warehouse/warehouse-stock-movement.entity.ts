import { BaseEntity } from 'src/core/utils/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Warehouse } from './warehouse.entity';
import { StockMovementType } from './stock-movement.enums';
import { ProductCondition } from './warehouse.enums';

@Entity('warehouse_stock_movements')
export class WarehouseStockMovement extends BaseEntity {
  @ManyToOne(() => Warehouse, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @Column({ type: 'enum', enum: StockMovementType, enumName: 'warehouse_stock_movement_type_enum' })
  type: StockMovementType;

  @Column({ type: 'int', nullable: false })
  quantity: number;

  @Column({ name: 'quantity_before', type: 'int', nullable: false })
  quantityBefore: number;

  @Column({ name: 'quantity_after', type: 'int', nullable: false })
  quantityAfter: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  unit?: string;

  @Column({ name: 'unit_price', type: 'float', nullable: true })
  unitPrice?: number;

  @Column({ name: 'weight_note', type: 'varchar', length: 100, nullable: true })
  weightNote?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  condition?: ProductCondition;

  @Column({ name: 'manufacturing_year', type: 'int', nullable: true })
  manufacturingYear?: number;

  @Column({ name: 'purchase_date', type: 'date', nullable: true })
  purchaseDate?: Date;

  @Column({ name: 'expiry_date', type: 'date', nullable: true })
  expiryDate?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reason?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;
}
