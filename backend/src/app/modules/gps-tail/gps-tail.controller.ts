import {
  Controller,
  Logger,
  UseGuards,
  Param,
  NotFoundException,
  Get,
  Req,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard, Roles, RolesGuard } from 'src/core/security';
import { UserRole } from 'src/core/enums/user-role';
import type { Request } from 'src/core/utils/request';

import { GpsTailService } from './gps-tail.service';
import { GpsTailDTO } from './dtos/gps-tail.dto';
import { GpsTailQueryDTO } from './dtos/query-gps-tail.dto';

import { PageRequest, pageRequestSortString } from 'src/core/utils/pagination.entity';
import { HeaderUtil } from 'src/core/utils/header-util';

import { mapGpsTailToDtoSelective } from './gps-tail.mapper';
import { FindOptionsWhere } from 'typeorm';
import { GpsTail } from './gps-tail.entity';

@Controller('api/gps-tails')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('gps-tails-module')
export class GpsTailController {
  private readonly logger = new Logger('GpsTailController');

  constructor(private readonly gpsTailService: GpsTailService) {}

  @Get('/')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get list of GPS tails paginated' })
  @ApiResponse({ status: 200, description: 'List of GPS tails', type: GpsTailDTO, isArray: true })
  async getAll(
    @Req() req: Request,
    @Query() query: GpsTailQueryDTO,
  ): Promise<Partial<GpsTailDTO>[]> {
    const pageRequest = new PageRequest(
      +(query.page ?? 1),
      +(query.pageSize ?? 10),
      pageRequestSortString(query.sortField, query.sortOrder),
    );

    const findOptions: FindOptionsWhere<GpsTail> = {};

    if (query.gpsDeviceId) {
      findOptions.gpsDevice = { id: query.gpsDeviceId };
    }
    const [results, count] = await this.gpsTailService.findAndCount(
      {
        skip: +pageRequest.page * pageRequest.size,
        take: +pageRequest.size,
        order: pageRequest.sort.asOrder(),
        where: findOptions,
      },
      query,
    );

    const dtos = mapGpsTailToDtoSelective(results, [
      'id',
      'latitude',
      'longitude',
      'sequenceOrder',
      'timestamp',
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
  @ApiOperation({ summary: 'Get GPS tail by id' })
  @ApiResponse({ status: 200, description: 'GPS Tail found', type: GpsTailDTO })
  async getById(@Param('id', ParseIntPipe) id: number): Promise<GpsTailDTO> {
    const existing = await this.gpsTailService.findByFields({
      where: { id },
      relations: ['gpsDevice'],
    });
    if (!existing) throw new NotFoundException(`GpsTail with id ${id} not found`);

    return mapGpsTailToDtoSelective(existing, [
      'id',
      'gpsDevice',
      'latitude',
      'longitude',
      'sequenceOrder',
      'timestamp',
      'createdBy',
      'updatedBy',
      'createdAt',
      'updatedAt',
    ]) as GpsTailDTO;
  }
}
