import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Warehouse } from './warehouse.entity';
import { WarehouseStockMovement } from './warehouse-stock-movement.entity';
import { WarehouseService } from './warehouse.service';
import { WarehouseStockMovementService } from './warehouse-stock-movement.service';
import { WarehouseController } from './warehouse.controller';
import { SupplierModule } from '../supplier/supplier.module';

@Module({
  imports: [TypeOrmModule.forFeature([Warehouse, WarehouseStockMovement]), SupplierModule],
  controllers: [WarehouseController],
  providers: [WarehouseService, WarehouseStockMovementService],
  exports: [WarehouseService, WarehouseStockMovementService],
})
export class WarehouseModule {}
