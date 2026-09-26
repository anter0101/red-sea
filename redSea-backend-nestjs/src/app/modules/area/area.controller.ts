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

import { AreaService } from './area.service';
import { AreaDTO } from './dtos/area.dto';
import { CreateAreaDTO } from './dtos/create-area.dto';
import { UpdateAreaDTO } from './dtos/update-area.dto';
import { AreaQueryDTO } from './dtos/query-area.dto';
import { UserDTO } from '../user/dtos/user.dto';
import { GovernmentService } from '../government/government.service';
import {
  mapAreaToAreaDtoSelective,
  mapCreateAreaDtoToEntity,
  mapUpdateAreaDtoToEntity,
} from './area.mapper';
import { Area } from './area.entity';
import { FindOptionsWhere } from 'typeorm';

@Controller('api/areas')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('areas-module')
export class AreaController {
  private readonly logger = new Logger('AreaController');

  constructor(
    private readonly areaService: AreaService,
    private readonly governmentService: GovernmentService,
  ) {}

  @Get('/')
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.DATA_ENTRY)
  @ApiOperation({ summary: 'Get list of areas paginated' })
  @ApiResponse({ status: 200, description: 'List of areas', type: AreaDTO, isArray: true })
  async getAllAreas(
    @Req() req: Request,
    @Query() query: AreaQueryDTO,
  ): Promise<Partial<AreaDTO>[]> {
    const pageRequest = new PageRequest(
      +(query.page ?? 1),
      +(query.pageSize ?? 10),
      pageRequestSortString(query.sortField, query.sortOrder),
    );

    const whereConditions: FindOptionsWhere<Area> = {};
    if (query.governmentId) {
      whereConditions.government = { id: query.governmentId };
    }

    const [results, count] = await this.areaService.findAndCount(
      {
        skip: +pageRequest.page * pageRequest.size,
        take: +pageRequest.size,
        order: pageRequest.sort.asOrder(),
        relations: ['government'],
        where: whereConditions,
      },
      query,
    );

    const dtos = mapAreaToAreaDtoSelective(results, [
      'id',
      'name',
      'government',
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
  @ApiOperation({ summary: 'Get area by id' })
  @ApiResponse({ status: 200, description: 'Area found', type: AreaDTO })
  async getAreaById(@Param('id', ParseIntPipe) id: number): Promise<AreaDTO> {
    const existing = await this.areaService.findByFields({
      where: { id },
      relations: ['government'],
    });
    if (!existing) throw new NotFoundException(`Area with id ${id} not found`);

    return mapAreaToAreaDtoSelective(existing, [
      'id',
      'name',
      'government',
      'createdBy',
      'updatedBy',
      'createdAt',
      'updatedAt',
    ]) as AreaDTO;
  }

  @Post('/')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new area' })
  @ApiResponse({ status: 201, description: 'Record created', type: AreaDTO })
  async create(@Body() dto: CreateAreaDTO, @AuthUser() user: UserDTO): Promise<AreaDTO> {
    const governmentId = (dto as any).governmentId as number | undefined;
    if (!governmentId) {
      throw new BadRequestException('governmentId is required');
    }

    const government = await this.governmentService.findById(governmentId);
    if (!government) throw new NotFoundException(`Government with id ${governmentId} not found`);

    const entity = mapCreateAreaDtoToEntity(dto);
    const saved = await this.areaService.save(entity, user?.email);
    return mapAreaToAreaDtoSelective(saved) as AreaDTO;
  }

  @Put('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update area' })
  @ApiResponse({ status: 200, description: 'Record updated', type: AreaDTO })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAreaDTO,
    @AuthUser() user: UserDTO,
  ): Promise<AreaDTO> {
    const existing = await this.areaService.findByFields({
      where: { id },
      relations: ['government'],
    });
    if (!existing) throw new NotFoundException(`Area with id ${id} not found`);

    const entity = mapUpdateAreaDtoToEntity(dto, existing);
    const updated = await this.areaService.update(entity, user?.email);
    return mapAreaToAreaDtoSelective(updated) as AreaDTO;
  }

  @Delete('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete area' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const existing = await this.areaService.findById(id);
    if (!existing) throw new NotFoundException(`Area with id ${id} not found`);

    await this.areaService.delete(id);
  }
}
