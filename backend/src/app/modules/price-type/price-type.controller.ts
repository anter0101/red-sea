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

import { PriceTypeService } from './price-type.service';
import { PriceTypeDTO } from './dtos/price-type.dto';
import { CreatePriceTypeDTO } from './dtos/create-price-type.dto';
import { UpdatePriceTypeDTO } from './dtos/update-price-type.dto';
import { PriceTypeQueryDTO } from './dtos/query-price-type.dto';
import { UserDTO } from '../user/dtos/user.dto';
import {
  mapCreatePriceTypeDtoToEntity,
  mapPriceTypeToPriceTypeDtoSelective,
  mapUpdatePriceTypeDtoToEntity,
} from './price-type.mapper';
import { PriceType } from './price-type.entity';
import { FindOptionsWhere } from 'typeorm';

@Controller('api/price-types')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('price-types-module')
export class PriceTypeController {
  private readonly logger = new Logger('PriceTypeController');

  constructor(private readonly priceTypeService: PriceTypeService) {}

  @Get('/')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get list of price types paginated' })
  @ApiResponse({
    status: 200,
    description: 'List of price types',
    type: PriceTypeDTO,
    isArray: true,
  })
  async getAllPriceTypes(
    @Req() req: Request,
    @Query() query: PriceTypeQueryDTO,
  ): Promise<Partial<PriceTypeDTO>[]> {
    const pageRequest = new PageRequest(
      +(query.page ?? 1),
      +(query.pageSize ?? 10),
      pageRequestSortString(query.sortField, query.sortOrder),
    );

    const whereConditions: FindOptionsWhere<PriceType> = {};
    if (query.name) {
      whereConditions.name = query.name;
    }

    const [results, count] = await this.priceTypeService.findAndCount(
      {
        skip: +pageRequest.page * pageRequest.size,
        take: +pageRequest.size,
        order: pageRequest.sort.asOrder(),
        where: whereConditions,
      },
      query,
    );

    const dtos = mapPriceTypeToPriceTypeDtoSelective(results, [
      'id',
      'name',
      'description',
      'createdBy',
      'updatedBy',
      'createdAt',
      'updatedAt',
    ]);

    HeaderUtil.addPaginationHeaders(
      req.res!,
      count,
      pageRequest.page,
      count > pageRequest.page * pageRequest.size,
    );

    return dtos;
  }

  @Get('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get price type by id' })
  @ApiResponse({ status: 200, description: 'Price type found', type: PriceTypeDTO })
  async getPriceTypeById(@Param('id', ParseIntPipe) id: number): Promise<PriceTypeDTO> {
    const existing = await this.priceTypeService.findByFields({
      where: { id },
    });
    if (!existing) throw new NotFoundException(`PriceType with id ${id} not found`);

    return mapPriceTypeToPriceTypeDtoSelective(existing, [
      'id',
      'name',
      'description',
      'createdBy',
      'updatedBy',
      'createdAt',
      'updatedAt',
    ]) as PriceTypeDTO;
  }

  @Post('/')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new price type' })
  @ApiResponse({ status: 201, description: 'Record created', type: PriceTypeDTO })
  async create(@Body() dto: CreatePriceTypeDTO, @AuthUser() user: UserDTO): Promise<PriceTypeDTO> {
    if (!dto.name) {
      throw new BadRequestException('name is required');
    }

    const entity = mapCreatePriceTypeDtoToEntity(dto);
    const saved = await this.priceTypeService.save(entity, user?.email);
    return mapPriceTypeToPriceTypeDtoSelective(saved) as PriceTypeDTO;
  }

  @Put('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update price type' })
  @ApiResponse({ status: 200, description: 'Record updated', type: PriceTypeDTO })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePriceTypeDTO,
    @AuthUser() user: UserDTO,
  ): Promise<PriceTypeDTO> {
    const existing = await this.priceTypeService.findByFields({
      where: { id },
    });
    if (!existing) throw new NotFoundException(`PriceType with id ${id} not found`);

    const entity = mapUpdatePriceTypeDtoToEntity(dto, existing);
    const updated = await this.priceTypeService.update(entity, user?.email);
    return mapPriceTypeToPriceTypeDtoSelective(updated) as PriceTypeDTO;
  }

  @Delete('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete price type' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const existing = await this.priceTypeService.findById(id);
    if (!existing) throw new NotFoundException(`PriceType with id ${id} not found`);

    await this.priceTypeService.delete(id);
  }
}
