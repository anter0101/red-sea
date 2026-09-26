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

import { TrailerManufacturerService } from './trailer-manufacturer.service';

import { TrailerManufacturerDTO } from './dtos/trailer-manufacturer.dto';
import { CreateTrailerManufacturerDTO } from './dtos/create-trailer-manufacturer.dto';

import {
  mapTrailerManufacturerToDtoSelective,
  mapCreateManufacturerDtoToEntity,
} from './trailer-manufacturer.mapper';

import { HeaderUtil } from 'src/core/utils/header-util';
import type { Request } from 'src/core/utils/request';
import { TrailerManufacturerQueryDTO } from './dtos/query-trailer-manufacturer.dto';
import { PageRequest, pageRequestSortString } from 'src/core/utils/pagination.entity';

@Controller('api/trailer-manufacturers')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('trailer-manufacturers-module')
export class TrailerManufacturerController {
  logger = new Logger('TrailerManufacturerController');

  constructor(private readonly manufacturerService: TrailerManufacturerService) {}

  // ------------------------------------------------------------------------
  // GET ALL (paginated)
  // ------------------------------------------------------------------------
  @Get('/')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get list of trailer manufacturers paginated' })
  @ApiResponse({
    status: 200,
    description: 'List of trailer manufacturers',
    type: TrailerManufacturerDTO,
    isArray: true,
  })
  async getAllManufacturers(
    @Req() req: Request,
    @Query() query: TrailerManufacturerQueryDTO,
  ): Promise<Partial<TrailerManufacturerDTO>[]> {
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

    const dtos = mapTrailerManufacturerToDtoSelective(results, [
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
  @ApiOperation({ summary: 'Create a new trailer manufacturer' })
  @ApiResponse({
    status: 201,
    description: 'Trailer manufacturer created',
    type: TrailerManufacturerDTO,
  })
  async create(
    @Body() dto: CreateTrailerManufacturerDTO,
    @AuthUser() user: any,
  ): Promise<Partial<TrailerManufacturerDTO>> {
    const mapped = mapCreateManufacturerDtoToEntity(dto);
    const saved = await this.manufacturerService.save(mapped, user?.email);

    return mapTrailerManufacturerToDtoSelective(saved);
  }

  // ----------------------------------------------------------------------
  // DELETE
  // ----------------------------------------------------------------------
  @Delete('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete trailer manufacturer' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const existing = await this.manufacturerService.findById(id);
    if (!existing) throw new NotFoundException(`Trailer manufacturer with id ${id} not found`);

    await this.manufacturerService.delete(existing.id);
  }
}
