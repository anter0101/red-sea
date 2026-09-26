import { SupplierService } from './../supplier/supplier.service';
import {
  Controller,
  Logger,
  UseGuards,
  Post,
  Put,
  Delete,
  Body,
  Param,
  NotFoundException,
  BadRequestException,
  Get,
  Req,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard, Roles, RolesGuard, AuthUser } from 'src/core/security';
import { UserRole } from 'src/core/enums/user-role';
import type { Request } from 'src/core/utils/request';

import { WarehouseService } from './warehouse.service';
import { WarehouseStockMovementService } from './warehouse-stock-movement.service';
import { WarehouseDTO } from './dtos/warehouse.dto';
import { CreateWarehouseDTO } from './dtos/create-warehouse.dto';
import { UpdateWarehouseDTO } from './dtos/update-warehouse.dto';
import { CreateStockMovementDTO } from './dtos/create-stock-movement.dto';
import { QueryStockMovementDTO } from './dtos/query-stock-movement.dto';
import { StockMovementDTO } from './dtos/stock-movement.dto';

import { PageRequest, pageRequestSortString } from 'src/core/utils/pagination.entity';
import { HeaderUtil } from 'src/core/utils/header-util';

import {
  mapCreateWarehouseDtoToEntity,
  mapWarehouseToWarehouseDtoSelective,
  mapUpdateWarehouseDtoToEntity,
} from './warehouse.mapper';
import { mapStockMovementToDto } from './warehouse-stock-movement.mapper';

import { UserDTO } from '../user/dtos/user.dto';
import { WarehouseQueryDTO } from './dtos/query-warehouse.dto';

@Controller('api/warehouses')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('warehouses-module')
export class WarehouseController {
  private readonly logger = new Logger('WarehouseController');

  constructor(
    private readonly warehouseService: WarehouseService,
    private readonly stockMovementService: WarehouseStockMovementService,
    private readonly supplierService: SupplierService,
  ) {}

  // ------------------------------------------------------------------------
  // GET ALL (paginated)
  // ------------------------------------------------------------------------
  @Get('/')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get list of warehouses paginated' })
  @ApiResponse({
    status: 200,
    description: 'List of warehouses',
    type: WarehouseDTO,
    isArray: true,
  })
  async getAllWarehouses(
    @Req() req: Request,
    @Query() query: WarehouseQueryDTO,
  ): Promise<Partial<WarehouseDTO>[]> {
    const pageRequest = new PageRequest(
      +(query.page ?? 1),
      +(query.pageSize ?? 10),
      pageRequestSortString(query.sortField, query.sortOrder),
    );

    const [results, count] = await this.warehouseService.findAndCount(
      {
        skip: +pageRequest.page * pageRequest.size,
        take: +pageRequest.size,
        order: pageRequest.sort.asOrder(),
      },
      query,
    );

    const lastUsedMap = await this.stockMovementService.getLastOutDatesByWarehouseIds(
      results.map((w) => w.id),
    );

    const dtos = mapWarehouseToWarehouseDtoSelective(results, [
      'id',
      'code',
      'name',
      'status',
      'condition',
      'category',
      'quantity',
      'alertQuantity',
      'unit',
      'supplier',
      'unitPrice',
      'manufacturingYear',
      'purchaseDate',
      'expiryDate',
      'lastUsedDate',
      'createdBy',
      'updatedBy',
      'createdAt',
      'updatedAt',
    ]).map((dto) => ({
      ...dto,
      lastUsedDate: dto.id != null ? (lastUsedMap.get(dto.id) ?? null) : null,
    }));

    HeaderUtil.addPaginationHeaders(
      req.res!,
      count,
      pageRequest.page,
      count > pageRequest.page * pageRequest.size,
    );

    return dtos;
  }

  // ------------------------------------------------------------------------
  // STOCK MOVEMENTS (before /:id)
  // ------------------------------------------------------------------------
  @Get('/:id/stock-movements')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'List stock movements for a warehouse product' })
  @ApiResponse({ status: 200, type: StockMovementDTO, isArray: true })
  async getStockMovements(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Query() query: QueryStockMovementDTO,
  ): Promise<StockMovementDTO[]> {
    const existing = await this.warehouseService.findById(id);
    if (!existing) throw new NotFoundException(`Warehouse with id ${id} not found`);

    const [results, count] = await this.stockMovementService.findByWarehouse(id, query);
    const page = Math.max(1, +(query.page ?? 1));
    const pageSize = Math.max(1, +(query.pageSize ?? 10));

    HeaderUtil.addPaginationHeaders(req.res!, count, page, count > page * pageSize);

    return results.map(mapStockMovementToDto);
  }

  @Post('/:id/stock-movements')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Apply stock IN / OUT / ADJUST movement' })
  @ApiResponse({ status: 201, type: StockMovementDTO })
  async createStockMovement(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateStockMovementDTO,
    @AuthUser() user: UserDTO,
  ): Promise<StockMovementDTO> {
    const movement = await this.stockMovementService.applyMovement(id, dto, user?.email);
    return mapStockMovementToDto(movement);
  }

  // ------------------------------------------------------------------------
  // GET BY ID
  // ------------------------------------------------------------------------
  @Get('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get warehouse by id' })
  @ApiResponse({ status: 200, description: 'Warehouse found', type: WarehouseDTO })
  async getWarehouseById(@Param('id', ParseIntPipe) id: number): Promise<WarehouseDTO> {
    const existing = await this.warehouseService.findByFields({ where: { id } });
    if (!existing) throw new NotFoundException(`Warehouse with id ${id} not found`);

    const lastUsedMap = await this.stockMovementService.getLastOutDatesByWarehouseIds([id]);

    const dto = mapWarehouseToWarehouseDtoSelective(existing, [
      'id',
      'code',
      'name',
      'status',
      'condition',
      'category',
      'quantity',
      'alertQuantity',
      'unit',
      'supplier',
      'unitPrice',
      'manufacturingYear',
      'purchaseDate',
      'expiryDate',
      'lastUsedDate',
      'createdBy',
      'updatedBy',
      'createdAt',
      'updatedAt',
    ]) as WarehouseDTO;

    dto.lastUsedDate = lastUsedMap.get(id) ?? null;
    return dto;
  }

  // ------------------------------------------------------------------------
  // CREATE
  // ------------------------------------------------------------------------
  @Post('/')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new warehouse record' })
  @ApiResponse({ status: 201, description: 'Record created', type: WarehouseDTO })
  async create(@Body() dto: CreateWarehouseDTO, @AuthUser() user: UserDTO): Promise<WarehouseDTO> {
    if (dto.name) {
      const existing = await this.warehouseService.findByFields({ where: { name: dto.name } });
      if (existing)
        throw new BadRequestException(`Warehouse item with name ${dto.name} already exists`);
    }

    const isSupplierExist = await this.supplierService.findById(dto.supplierId);
    if (!isSupplierExist)
      throw new BadRequestException(`Supplier with id ${dto.supplierId} does not exist`);

    const entity = mapCreateWarehouseDtoToEntity(dto);
    const saved = await this.warehouseService.save(entity, user?.email);
    return mapWarehouseToWarehouseDtoSelective(saved, [
      'id',
      'code',
      'name',
      'status',
      'condition',
      'category',
      'quantity',
      'alertQuantity',
      'unit',
      'supplier',
      'unitPrice',
      'manufacturingYear',
      'purchaseDate',
      'expiryDate',
      'createdAt',
      'updatedAt',
    ]) as WarehouseDTO;
  }

  // ------------------------------------------------------------------------
  // UPDATE
  // ------------------------------------------------------------------------
  @Put('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update warehouse record' })
  @ApiResponse({ status: 200, description: 'Record updated', type: WarehouseDTO })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWarehouseDTO,
    @AuthUser() user: UserDTO,
  ): Promise<WarehouseDTO> {
    const existing = await this.warehouseService.findByFields({ where: { id } });
    if (!existing) throw new NotFoundException(`Warehouse with id ${id} not found`);

    dto.id = id;

    if (dto.name) {
      const existingName = await this.warehouseService.findByFields({
        where: { name: dto.name },
      });

      if (existingName && existingName.id !== id) {
        throw new BadRequestException(`Warehouse item with name ${dto.name} already exists`);
      }
    }

    if (dto.supplierId) {
      const isSupplierExist = await this.supplierService.findById(dto.supplierId);
      if (!isSupplierExist)
        throw new BadRequestException(`Supplier with id ${dto.supplierId} does not exist`);
    }
    const entity = mapUpdateWarehouseDtoToEntity(dto);
    return this.warehouseService.update(entity, user?.email);
  }

  // ------------------------------------------------------------------------
  // DELETE
  // ------------------------------------------------------------------------
  @Delete('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete warehouse record' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const existing = await this.warehouseService.findById(id);
    if (!existing) throw new NotFoundException(`Warehouse with id ${id} not found`);

    await this.warehouseService.delete(id);
  }
}
