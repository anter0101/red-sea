import { UpdateGridsDTO } from './dtos/update-grids.dto';

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
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard, Roles, RolesGuard, AuthUser } from 'src/core/security';
import { UserRole } from 'src/core/enums/user-role';

import { GridsService } from './grid.service';
import { GridsDTO } from './dtos/grids.dto';
import { CreateGridsDTO } from './dtos/create-grids.dto';
import { mapGridsToDtoSelective, mapCreateGridsDtoToEntity } from './grid.mapper';
import { HeaderUtil } from 'src/core/utils/header-util';
import type { Request } from 'src/core/utils/request';
import { GridsQueryDTO } from './dtos/query-grids.dto';
import { PageRequest, pageRequestSortString } from 'src/core/utils/pagination.entity';

@Controller('api/grids')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('grids-module')
export class GridsController {
  logger = new Logger('GridsController');

  constructor(private readonly gridsService: GridsService) {}

  // ------------------------------------------------------------------------
  // GET ALL (paginated)
  // ------------------------------------------------------------------------
  @Get('/')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get list of grids paginated' })
  @ApiResponse({
    status: 200,
    description: 'List of grids',
    type: GridsDTO,
    isArray: true,
  })
  async getAll(@Req() req: Request, @Query() query: GridsQueryDTO): Promise<Partial<GridsDTO>[]> {
    const pageRequest = new PageRequest(
      +(query.page ?? 1),
      +(query.pageSize ?? 10),
      pageRequestSortString(query.sortField, query.sortOrder),
    );

    const [results, count] = await this.gridsService.findAndCount(
      {
        skip: +pageRequest.page * pageRequest.size,
        take: +pageRequest.size,
        order: pageRequest.sort.asOrder(),
      },
      query,
    );

    const dtos = mapGridsToDtoSelective(results, [
      'id',
      'user',
      'pageKey',
      'columns',
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
  // GET by pageKey and user
  // ----------------------------------------------------------------------
  @Get('/by-page-key/:pageKey')
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.DATA_ENTRY)
  @ApiOperation({ summary: 'Get grid by pageKey and user' })
  @ApiResponse({
    status: 200,
    description: 'Grid prefs for this user/pageKey, or empty columns when none saved yet',
    type: GridsDTO,
  })
  async getByPageKey(
    @Param('pageKey') pageKey: string,
    @AuthUser() user: any,
  ): Promise<Partial<GridsDTO>> {
    const grid = await this.gridsService.findByFields({
      where: { pageKey, user: { id: user.id } },
      relations: ['user'],
    });
    // Never return null — Nest maps null controller results to HTTP 404.
    if (!grid) return { pageKey, columns: [] };
    return mapGridsToDtoSelective(grid);
  }
  // ----------------------------------------------------------------------
  // CREATE
  // ----------------------------------------------------------------------
  @Post('/')
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.DATA_ENTRY)
  @ApiOperation({ summary: 'Create a new grid' })
  @ApiResponse({
    status: 201,
    description: 'Grid created',
    type: GridsDTO,
  })
  async create(@Body() dto: CreateGridsDTO, @AuthUser() user: any): Promise<Partial<GridsDTO>> {
    const mapped = mapCreateGridsDtoToEntity(dto, user);
    const saved = await this.gridsService.save(mapped, user?.email);
    return mapGridsToDtoSelective(saved);
  }

  // ----------------------------------------------------------------------
  // UPDATE by pageKey and user (upsert)
  // ----------------------------------------------------------------------
  @Put('/')
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.DATA_ENTRY)
  @ApiOperation({ summary: 'Update or create grid by pageKey and user' })
  @ApiResponse({
    status: 200,
    description: 'Grid updated or created',
    type: GridsDTO,
  })
  async updateByPageKey(
    @Body() dto: UpdateGridsDTO,
    @AuthUser() user: any,
  ): Promise<Partial<GridsDTO>> {
    const existing = await this.gridsService.findByFields({
      where: { pageKey: dto.pageKey, user: { id: user.id } },
      relations: ['user'],
    });
    if (!existing) {
      const mapped = mapCreateGridsDtoToEntity(
        { pageKey: dto.pageKey!, columns: dto.columns ?? [] },
        user,
      );
      const saved = await this.gridsService.save(mapped, user?.email);
      return mapGridsToDtoSelective(saved);
    }
    if (dto.columns !== undefined) existing.columns = dto.columns;
    const updated = await this.gridsService.update(existing, user?.email);
    return mapGridsToDtoSelective(updated);
  }
  // ----------------------------------------------------------------------
  // DELETE
  // ----------------------------------------------------------------------
  @Delete('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete grid' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const existing = await this.gridsService.findById(id);
    if (!existing) throw new NotFoundException(`Grid with id ${id} not found`);
    await this.gridsService.delete(existing.id);
  }
}
