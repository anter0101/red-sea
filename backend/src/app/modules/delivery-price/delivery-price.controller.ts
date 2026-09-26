import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard, AuthUser, Roles, RolesGuard } from 'src/core/security';
import { UserRole } from 'src/core/enums/user-role';
import type { Request } from 'src/core/utils/request';
import { PageRequest, pageRequestSortString } from 'src/core/utils/pagination.entity';
import { HeaderUtil } from 'src/core/utils/header-util';

import { DeliveryPriceService } from './delivery-price.service';
import { DeliveryPriceDTO } from './dtos/delivery-price.dto';
import { CreateDeliveryPriceDTO } from './dtos/create-delivery-price.dto';
import { UpdateDeliveryPriceDTO } from './dtos/update-delivery-price.dto';
import { DeliveryPriceQueryDTO } from './dtos/query-delivery-price.dto';
import { BulkCreateDeliveryPriceDTO } from './dtos/bulk-create-delivery-price.dto';
import {
  mapCreateDeliveryPriceDtoToEntity,
  mapDeliveryPricesGrouped,
  mapDeliveryPriceToDeliveryPriceDtoSelective,
  mapUpdateDeliveryPriceDtoToEntity,
} from './delivery-price.mapper';
import { UserDTO } from '../user/dtos/user.dto';
import { ClientService } from '../factory/client.service';
import { AreaService } from '../area/area.service';
import { PriceTypeService } from '../price-type/price-type.service';

@Controller('api/delivery-prices')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('delivery-prices-module')
export class DeliveryPriceController {
  private readonly logger = new Logger('DeliveryPriceController');

  constructor(
    private readonly deliveryPriceService: DeliveryPriceService,
    private readonly clientService: ClientService,
    private readonly areaService: AreaService,
    private readonly priceTypeService: PriceTypeService,
  ) {}

  @Get('/')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get list of delivery prices grouped by government and area' })
  @ApiResponse({
    status: 200,
    description: 'Delivery prices grouped by government and area',
    isArray: true,
  })
  async getAll(@Req() req: Request, @Query() query: DeliveryPriceQueryDTO): Promise<any> {
    const pageRequest = new PageRequest(
      +(query.page ?? 1), // zero-based for skip
      +(query.pageSize ?? 10),
      pageRequestSortString(query.sortField, query.sortOrder),
    );

    // Fetch delivery prices with QueryBuilder
    const [results, count] = await this.deliveryPriceService.findAndCount(
      query,
      pageRequest.page,
      pageRequest.size,
      query.sortField,
      (query.sortOrder as 'ASC' | 'DESC') || 'ASC',
    );

    // Add pagination headers to the response
    HeaderUtil.addPaginationHeaders(
      req.res!,
      count,
      pageRequest.page,
      count > pageRequest.page * pageRequest.size,
    );

    return mapDeliveryPricesGrouped(results);
  }

  @Get('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get delivery price by id' })
  @ApiResponse({ status: 200, description: 'Delivery price found', type: DeliveryPriceDTO })
  async getDeliveryPriceById(@Param('id', ParseIntPipe) id: number): Promise<DeliveryPriceDTO> {
    const existing = await this.deliveryPriceService.findByFields({
      where: { id },
      relations: ['client', 'area', 'priceType'],
    });
    if (!existing) throw new NotFoundException(`DeliveryPrice with id ${id} not found`);

    return mapDeliveryPriceToDeliveryPriceDtoSelective(existing, [
      'id',
      'client',
      'area',
      'priceType',
      'basePrice',
      'additionalFees',
      'taxPrice',
      'totalPrice',
      'nolonPrice',
      'employeeNolonAmount',
      'validFrom',
      'validTo',
      'notes',
      'createdBy',
      'updatedBy',
      'createdAt',
      'updatedAt',
    ]) as DeliveryPriceDTO;
  }

  @Post('/')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new delivery price' })
  @ApiResponse({ status: 201, description: 'Record created', type: DeliveryPriceDTO })
  async create(
    @Body() dto: CreateDeliveryPriceDTO,
    @AuthUser() user: UserDTO,
  ): Promise<DeliveryPriceDTO> {
    if (!dto.clientId) {
      throw new BadRequestException('clientId is required');
    }
    if (!dto.areaId) {
      throw new BadRequestException('areaId is required');
    }

    const client = await this.clientService.findById(dto.clientId);
    if (!client) throw new NotFoundException(`Client with id ${dto.clientId} not found`);

    const area = await this.areaService.findById(dto.areaId);
    if (!area) throw new NotFoundException(`Area with id ${dto.areaId} not found`);

    if (dto.priceTypeId !== undefined) {
      const priceType = await this.priceTypeService.findById(dto.priceTypeId);
      if (!priceType) throw new NotFoundException(`PriceType with id ${dto.priceTypeId} not found`);
    }

    const entity = mapCreateDeliveryPriceDtoToEntity(dto);
    const saved = await this.deliveryPriceService.save(entity, user?.email);
    return mapDeliveryPriceToDeliveryPriceDtoSelective(saved) as DeliveryPriceDTO;
  }

  @Post('/bulk')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create multiple delivery prices for the same client' })
  @ApiResponse({
    status: 201,
    description: 'Records created',
    type: DeliveryPriceDTO,
    isArray: true,
  })
  async bulkCreate(
    @Body() dto: BulkCreateDeliveryPriceDTO,
    @AuthUser() user: UserDTO,
  ): Promise<DeliveryPriceDTO[]> {
    if (!dto.clientId) {
      throw new BadRequestException('clientId is required');
    }
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('items must contain at least one entry');
    }

    const client = await this.clientService.findById(dto.clientId);
    if (!client) {
      throw new NotFoundException(`Client with id ${dto.clientId} not found`);
    }

    // Validate referenced areas and price types
    for (const item of dto.items) {
      const area = await this.areaService.findById(item.areaId);
      if (!area) {
        throw new NotFoundException(`Area with id ${item.areaId} not found`);
      }

      if (item.priceTypeId !== undefined) {
        const priceType = await this.priceTypeService.findById(item.priceTypeId);
        if (!priceType) {
          throw new NotFoundException(`PriceType with id ${item.priceTypeId} not found`);
        }
      }
    }

    const entities = dto.items.map((item) =>
      mapCreateDeliveryPriceDtoToEntity({
        clientId: dto.clientId,
        areaId: item.areaId,
        priceTypeId: item.priceTypeId,
        basePrice: item.basePrice,
        additionalFees: item.additionalFees,
        taxPrice: item.taxPrice,
        nolonPrice: item.nolonPrice,
        employeeNolonAmount: item.employeeNolonAmount,
        validFrom: item.validFrom,
        validTo: item.validTo,
        notes: item.notes,
      } as any),
    );

    const saved = await this.deliveryPriceService.saveMany(entities, user?.email);
    return mapDeliveryPriceToDeliveryPriceDtoSelective(saved, [
      'id',
      'client',
      'area',
      'priceType',
      'basePrice',
      'additionalFees',
      'taxPrice',
      'totalPrice',
      'nolonPrice',
      'employeeNolonAmount',
      'validFrom',
      'validTo',
      'notes',
      'createdBy',
      'updatedBy',
      'createdAt',
      'updatedAt',
    ]) as DeliveryPriceDTO[];
  }

  @Put('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update delivery price' })
  @ApiResponse({ status: 200, description: 'Record updated', type: DeliveryPriceDTO })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDeliveryPriceDTO,
    @AuthUser() user: UserDTO,
  ): Promise<DeliveryPriceDTO> {
    const existing = await this.deliveryPriceService.findByFields({
      where: { id },
      relations: ['client', 'area', 'priceType'],
    });
    if (!existing) throw new NotFoundException(`DeliveryPrice with id ${id} not found`);

    if (dto.clientId !== undefined) {
      const client = await this.clientService.findById(dto.clientId);
      if (!client) {
        throw new NotFoundException(`Client with id ${dto.clientId} not found`);
      }
    }

    if (dto.areaId !== undefined) {
      const area = await this.areaService.findById(dto.areaId);
      if (!area) {
        throw new NotFoundException(`Area with id ${dto.areaId} not found`);
      }
    }

    if (dto.priceTypeId !== undefined) {
      const priceType = await this.priceTypeService.findById(dto.priceTypeId);
      if (!priceType) {
        throw new NotFoundException(`PriceType with id ${dto.priceTypeId} not found`);
      }
    }

    const entity = mapUpdateDeliveryPriceDtoToEntity(dto, existing);
    const updated = await this.deliveryPriceService.update(entity, user?.email);
    return mapDeliveryPriceToDeliveryPriceDtoSelective(updated) as DeliveryPriceDTO;
  }

  @Delete('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete delivery price' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const existing = await this.deliveryPriceService.findById(id);
    if (!existing) throw new NotFoundException(`DeliveryPrice with id ${id} not found`);

    await this.deliveryPriceService.delete(id);
  }
}
