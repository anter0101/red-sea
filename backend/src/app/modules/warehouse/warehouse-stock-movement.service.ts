import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Warehouse } from './warehouse.entity';
import { WarehouseStockMovement } from './warehouse-stock-movement.entity';
import { CreateStockMovementDTO } from './dtos/create-stock-movement.dto';
import { QueryStockMovementDTO } from './dtos/query-stock-movement.dto';
import { StockMovementType } from './stock-movement.enums';
import { resolveStockStatus } from './warehouse-stock.util';

@Injectable()
export class WarehouseStockMovementService {
  constructor(
    @InjectRepository(WarehouseStockMovement)
    private readonly movementRepository: Repository<WarehouseStockMovement>,
    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
    private readonly dataSource: DataSource,
  ) {}

  async findByWarehouse(
    warehouseId: number,
    query?: QueryStockMovementDTO,
  ): Promise<[WarehouseStockMovement[], number]> {
    const page = Math.max(1, +(query?.page ?? 1));
    const pageSize = Math.max(1, +(query?.pageSize ?? 10));

    return this.movementRepository.findAndCount({
      where: { warehouse: { id: warehouseId } },
      order: { createdAt: 'DESC', id: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }

  async applyMovement(
    warehouseId: number,
    dto: CreateStockMovementDTO,
    actor?: string,
  ): Promise<WarehouseStockMovement> {
    return this.dataSource.transaction(async (manager) => {
      const warehouseRepo = manager.getRepository(Warehouse);
      const movementRepo = manager.getRepository(WarehouseStockMovement);

      const warehouse = await warehouseRepo.findOne({ where: { id: warehouseId } });
      if (!warehouse) {
        throw new NotFoundException(`Warehouse with id ${warehouseId} not found`);
      }

      const quantityBefore = warehouse.quantity ?? 0;
      let quantityAfter = quantityBefore;
      let loggedQuantity = dto.quantity;

      if (dto.type === StockMovementType.IN) {
        if (dto.quantity <= 0) {
          throw new BadRequestException('IN quantity must be greater than 0');
        }
        quantityAfter = quantityBefore + dto.quantity;
      } else if (dto.type === StockMovementType.OUT) {
        if (dto.quantity <= 0) {
          throw new BadRequestException('OUT quantity must be greater than 0');
        }
        if (dto.quantity > quantityBefore) {
          throw new BadRequestException(
            `Insufficient stock: available ${quantityBefore}, requested ${dto.quantity}`,
          );
        }
        quantityAfter = quantityBefore - dto.quantity;
      } else {
        // ADJUST: set absolute stock level
        quantityAfter = dto.quantity;
        loggedQuantity = Math.abs(quantityAfter - quantityBefore);
      }

      warehouse.quantity = quantityAfter;
      warehouse.status = resolveStockStatus(warehouse.status, quantityAfter);
      warehouse.updatedAt = new Date();
      if (actor) warehouse.updatedBy = actor;
      await warehouseRepo.save(warehouse);

      const movement = movementRepo.create({
        warehouse: { id: warehouseId } as Warehouse,
        type: dto.type,
        quantity: loggedQuantity,
        quantityBefore,
        quantityAfter,
        unit: dto.unit ?? warehouse.unit,
        unitPrice: dto.unitPrice ?? warehouse.unitPrice,
        weightNote: dto.weightNote,
        condition: dto.condition ?? warehouse.condition,
        manufacturingYear: dto.manufacturingYear ?? warehouse.manufacturingYear,
        purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : warehouse.purchaseDate,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : warehouse.expiryDate,
        reason: dto.reason,
        notes: dto.notes,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: actor,
        updatedBy: actor,
      });

      return movementRepo.save(movement);
    });
  }

  async getLastOutDatesByWarehouseIds(warehouseIds: number[]): Promise<Map<number, Date>> {
    const map = new Map<number, Date>();
    if (warehouseIds.length === 0) return map;

    const rows = await this.movementRepository
      .createQueryBuilder('m')
      .select('m.warehouse_id', 'warehouseId')
      .addSelect('MAX(m.created_at)', 'lastUsedDate')
      .where('m.warehouse_id IN (:...ids)', { ids: warehouseIds })
      .andWhere('m.type = :type', { type: StockMovementType.OUT })
      .groupBy('m.warehouse_id')
      .getRawMany<{ warehouseId: string; lastUsedDate: Date }>();

    for (const row of rows) {
      map.set(Number(row.warehouseId), row.lastUsedDate);
    }

    return map;
  }
}
