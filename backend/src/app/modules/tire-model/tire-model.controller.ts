import { Controller, Get, Post, Delete, Param, Query, Body, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TireModelService } from './tire-model.service';
import { HeaderUtil } from 'src/core/utils/header-util';
import { Roles } from 'src/core/security';
import { UserRole } from 'src/core/enums/user-role';
import { TireModelDTO } from './dtos/tire-model.dto';
import { TireModelQueryDTO } from './dtos/query-tire-model.dto';
import { PageRequest, pageRequestSortString } from 'src/core/utils/pagination.entity';
import type { Request } from 'src/core/utils/request';
import { CreateTireModelDTO } from './dtos/create-tire-model.dto';
import { mapTireModelToDtoSelective } from './tire-model.mapper';

@ApiTags('Tire Models')
@Controller('api/tire-models')
export class TireModelController {
  constructor(private readonly tireModelService: TireModelService) {}

  // ------------------------------------------------------------------------
  // GET ALL PAGINATED
  // ------------------------------------------------------------------------
  @Get('/')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get list of tire models paginated' })
  @ApiResponse({
    status: 200,
    type: TireModelDTO,
    isArray: true,
  })
  async getAll(
    @Req() req: Request,
    @Query() query: TireModelQueryDTO,
  ): Promise<Partial<TireModelDTO>[]> {
    const pageRequest = new PageRequest(
      +(query.page ?? 1),
      +(query.pageSize ?? 10),
      pageRequestSortString(query.sortField, query.sortOrder),
    );

    const where: any = {};

    if (query.name) where.name = query.name;

    const [results, count] = await this.tireModelService.findAndCount(
      {
        where,
        skip: +pageRequest.page * pageRequest.size,
        take: +pageRequest.size,
        order: pageRequest.sort.asOrder(),
      },
      query,
    );

    const dtos = mapTireModelToDtoSelective(results, [
      'id',
      'name',
      'createdAt',
      'updatedAt',
      'createdBy',
      'updatedBy',
    ]);

    HeaderUtil.addPaginationHeaders(
      req.res!,
      count,
      pageRequest.page,
      count > pageRequest.page * pageRequest.size,
    );

    return dtos;
  }

  // ------------------------------------------------------------------------
  // CREATE
  // ------------------------------------------------------------------------
  @Post('/')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a tire model' })
  async create(@Body() dto: CreateTireModelDTO, @Req() req: Request) {
    return await this.tireModelService.create(
      {
        name: dto.name,
      },
      req.user?.username,
    );
  }

  // ------------------------------------------------------------------------
  // DELETE
  // ------------------------------------------------------------------------
  @Delete('/:id')
  @Roles(UserRole.ADMIN)
  async delete(@Param('id') id: number) {
    await this.tireModelService.delete(id);
    return { message: 'Tire model deleted' };
  }
}
