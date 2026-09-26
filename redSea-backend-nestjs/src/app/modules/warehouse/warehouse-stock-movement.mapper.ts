import { WarehouseStockMovement } from './warehouse-stock-movement.entity';
import { StockMovementDTO } from './dtos/stock-movement.dto';
import { BaseDTO } from 'src/core/utils/base.dto';

const allowedKeys: ReadonlyArray<keyof StockMovementDTO | keyof BaseDTO> = [
  'id',
  'type',
  'quantity',
  'quantityBefore',
  'quantityAfter',
  'unit',
  'unitPrice',
  'weightNote',
  'condition',
  'manufacturingYear',
  'purchaseDate',
  'expiryDate',
  'reason',
  'notes',
  'createdBy',
  'updatedBy',
  'createdAt',
  'updatedAt',
] as const;

export function mapStockMovementToDto(movement: WarehouseStockMovement): StockMovementDTO {
  const dto = new StockMovementDTO();

  for (const key of allowedKeys) {
    if (key in movement && (movement as any)[key] !== undefined) {
      (dto as any)[key] = (movement as any)[key];
    }
  }

  if (movement.warehouse?.id != null) {
    dto.warehouseId = movement.warehouse.id;
  }

  return dto;
}
