import {
  Controller,
  Logger,
  UseGuards,
  Post,
  Delete,
  Body,
  Param,
  NotFoundException,
  Get,
  ParseIntPipe,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard, Roles, RolesGuard, AuthUser } from 'src/core/security';
import { UserRole } from 'src/core/enums/user-role';

import { CarManufacturerService } from './car-manufacturer.service';

import { CarManufacturerDTO } from './dtos/car-manufacturer.dto';
import { CreateCarManufacturerDTO } from './dtos/create-car-manufacturer.dto';

import {
  mapCarManufacturerToDtoSelective,
  mapCreateManufacturerDtoToEntity,
} from './car-manufacturer.mapper';

import { HeaderUtil } from 'src/core/utils/header-util';
import type { Request } from 'src/core/utils/request';
import { CarManufacturerQueryDTO } from './dtos/query-car-manufacturer.dto';
import { PageRequest, pageRequestSortString } from 'src/core/utils/pagination.entity';

@Controller('api/car-manufacturers')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('car-manufacturers-module')
export class CarManufacturerController {
  logger = new Logger('CarManufacturerController');

  constructor(private readonly manufacturerService: CarManufacturerService) {}

  // ------------------------------------------------------------------------
  // GET ALL (paginated)
  // ------------------------------------------------------------------------
  @Get('/')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get list of car manufacturers paginated' })
  @ApiResponse({
    status: 200,
    description: 'List of car manufacturers',
    type: CarManufacturerDTO,
    isArray: true,
  })
  async getAllManufacturers(
    @Req() req: Request,
    @Query() query: CarManufacturerQueryDTO,
  ): Promise<Partial<CarManufacturerDTO>[]> {
    const pageRequest = new PageRequest(
      +(query.page ?? 1),
      +(query.pageSize ?? 10),
      pageRequestSortString(query.sortField, query.sortOrder),
    );

    const [results, count] = await this.manufacturerService.findAndCount(
      {
        skip: +pageRequest.page * pageRequest.size,
        take: +pageRequest.size,
        order: pageRequest.sort.asOrder(),
      },
      query,
    );

    const dtos = mapCarManufacturerToDtoSelective(results, [
      'id',
      'name',
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

  // ----------------------------------------------------------------------
  // CREATE
  // ----------------------------------------------------------------------
  @Post('/')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new car manufacturer' })
  @ApiResponse({
    status: 201,
    description: 'Car manufacturer created',
    type: CarManufacturerDTO,
  })
  async create(
    @Body() dto: CreateCarManufacturerDTO,
    @AuthUser() user: any,
  ): Promise<Partial<CarManufacturerDTO>> {
    const mapped = mapCreateManufacturerDtoToEntity(dto);
    const saved = await this.manufacturerService.save(mapped, user?.email);

    return mapCarManufacturerToDtoSelective(saved);
  }

  // ----------------------------------------------------------------------
  // DELETE
  // ----------------------------------------------------------------------
  @Delete('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete car manufacturer' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const existing = await this.manufacturerService.findById(id);
    if (!existing) throw new NotFoundException(`Car manufacturer with id ${id} not found`);

    await this.manufacturerService.delete(existing.id);
  }
}
