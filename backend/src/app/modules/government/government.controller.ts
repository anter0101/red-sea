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

import { GovernmentService } from './government.service';
import { GovernmentDTO } from './dtos/government.dto';
import { CreateGovernmentDTO } from './dtos/create-government.dto';
import { UpdateGovernmentDTO } from './dtos/update-government.dto';
import { GovernmentQueryDTO } from './dtos/query-government.dto';
import { UserDTO } from '../user/dtos/user.dto';
import {
  mapCreateGovernmentDtoToEntity,
  mapGovernmentToGovernmentDtoSelective,
  mapUpdateGovernmentDtoToEntity,
} from './government.mapper';

@Controller('api/governments')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('governments-module')
export class GovernmentController {
  private readonly logger = new Logger('GovernmentController');

  constructor(private readonly governmentService: GovernmentService) {}

  @Get('/')
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.DATA_ENTRY)
  @ApiOperation({ summary: 'Get list of governments paginated' })
  @ApiResponse({
    status: 200,
    description: 'List of governments',
    type: GovernmentDTO,
    isArray: true,
  })
  async getAllGovernments(
    @Req() req: Request,
    @Query() query: GovernmentQueryDTO,
  ): Promise<Partial<GovernmentDTO>[]> {
    const pageRequest = new PageRequest(
      +(query.page ?? 1),
      +(query.pageSize ?? 10),
      pageRequestSortString(query.sortField, query.sortOrder),
    );

    const [results, count] = await this.governmentService.findAndCount(
      {
        skip: +pageRequest.page * pageRequest.size,
        take: +pageRequest.size,
        order: pageRequest.sort.asOrder(),
      },
      query,
    );

    const dtos = mapGovernmentToGovernmentDtoSelective(results, [
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

  @Get('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get government by id' })
  @ApiResponse({ status: 200, description: 'Government found', type: GovernmentDTO })
  async getGovernmentById(@Param('id', ParseIntPipe) id: number): Promise<GovernmentDTO> {
    const existing = await this.governmentService.findByFields({ where: { id } });
    if (!existing) throw new NotFoundException(`Government with id ${id} not found`);

    return mapGovernmentToGovernmentDtoSelective(existing, [
      'id',
      'name',
      'createdBy',
      'updatedBy',
      'createdAt',
      'updatedAt',
    ]) as GovernmentDTO;
  }

  @Post('/')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new government' })
  @ApiResponse({ status: 201, description: 'Record created', type: GovernmentDTO })
  async create(
    @Body() dto: CreateGovernmentDTO,
    @AuthUser() user: UserDTO,
  ): Promise<GovernmentDTO> {
    const existing = await this.governmentService.findByFields({ where: { name: dto.name } });
    if (existing) throw new BadRequestException(`Government with name ${dto.name} already exists`);

    const entity = mapCreateGovernmentDtoToEntity(dto);
    return this.governmentService.save(entity, user?.email);
  }

  @Put('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update government' })
  @ApiResponse({ status: 200, description: 'Record updated', type: GovernmentDTO })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGovernmentDTO,
    @AuthUser() user: UserDTO,
  ): Promise<GovernmentDTO> {
    const existing = await this.governmentService.findByFields({ where: { id } });
    if (!existing) throw new NotFoundException(`Government with id ${id} not found`);

    dto.id = id;

    if (dto.name) {
      const existingByName = await this.governmentService.findByFields({
        where: { name: dto.name },
      });
      if (existingByName && existingByName.id !== id) {
        throw new BadRequestException(`Government with name ${dto.name} already exists`);
      }
    }

    const entity = mapUpdateGovernmentDtoToEntity(dto);
    return this.governmentService.update(entity, user?.email);
  }

  @Delete('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete government' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const existing = await this.governmentService.findById(id);
    if (!existing) throw new NotFoundException(`Government with id ${id} not found`);

    await this.governmentService.delete(id);
  }
}
