// src/branch/branch.controller.ts
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

import { BranchService } from './branch.service';
import { BranchDTO } from './dtos/branch.dto';
import { CreateBranchDTO } from './dtos/create-branch.dto';
import { UpdateBranchDTO } from './dtos/update-branch.dto';

import { PageRequest, pageRequestSortString } from 'src/core/utils/pagination.entity';
import { HeaderUtil } from 'src/core/utils/header-util';

import {
  mapCreateBranchDtoToEntity,
  mapBranchToBranchDtoSelective,
  mapUpdateBranchDtoToEntity,
} from './branch.mapper';

import { UserDTO } from '../user/dtos/user.dto';
import { BranchQueryDTO } from './dtos/query-branch.dto';

@Controller('api/branches')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('branches-module')
export class BranchController {
  private readonly logger = new Logger('BranchController');

  constructor(private readonly branchService: BranchService) {}

  // ------------------------------------------------------------------------
  // GET ALL (paginated)
  // ------------------------------------------------------------------------
  @Get('/')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get list of branches paginated' })
  @ApiResponse({
    status: 200,
    description: 'List of branches',
    type: BranchDTO,
    isArray: true,
  })
  async getAllBranches(
    @Req() req: Request,
    @Query() query: BranchQueryDTO,
  ): Promise<Partial<BranchDTO>[]> {
    const pageRequest = new PageRequest(
      +(query.page ?? 1),
      +(query.pageSize ?? 10),
      pageRequestSortString(query.sortField, query.sortOrder),
    );

    const [results, count] = await this.branchService.findAndCount(
      {
        skip: +pageRequest.page * pageRequest.size,
        take: +pageRequest.size,
        order: pageRequest.sort.asOrder(),
      },
      query,
    );

    const dtos = mapBranchToBranchDtoSelective(results, [
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

  // ------------------------------------------------------------------------
  // GET BY ID
  // ------------------------------------------------------------------------
  @Get('/:id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get branch by id' })
  @ApiResponse({ status: 200, description: 'Branch found', type: BranchDTO })
  async getBranchById(@Param('id', ParseIntPipe) id: number): Promise<BranchDTO> {
    const existing = await this.branchService.findByFields({ where: { id } });
    if (!existing) throw new NotFoundException(`Branch with id ${id} not found`);

    return mapBranchToBranchDtoSelective(existing, [
      'id',
      'name',
      'createdBy',
      'updatedBy',
      'createdAt',
      'updatedAt',
    ]) as BranchDTO;
  }

  // ------------------------------------------------------------------------
  // CREATE
  // ------------------------------------------------------------------------
  @Post('/')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new branch' })
  @ApiResponse({ status: 201, description: 'Branch created', type: BranchDTO })
  async create(@Body() dto: CreateBranchDTO, @AuthUser() user: UserDTO): Promise<BranchDTO> {
    // Optional: prevent duplicate branch names (or make it unique in DB)
    const existing = await this.branchService.findByFields({
      where: { name: dto.name },
    });

    if (existing) {
      throw new BadRequestException(`Branch with name "${dto.name}" already exists`);
    }

    const entity = mapCreateBranchDtoToEntity(dto);
    return this.branchService.save(entity, user?.email);
  }

  // ------------------------------------------------------------------------
  // UPDATE
  // ------------------------------------------------------------------------
  @Put('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update branch' })
  @ApiResponse({ status: 200, description: 'Branch updated', type: BranchDTO })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBranchDTO,
    @AuthUser() user: UserDTO,
  ): Promise<BranchDTO> {
    const existing = await this.branchService.findByFields({ where: { id } });
    if (!existing) throw new NotFoundException(`Branch with id ${id} not found`);

    // Prevent changing to a name that already exists (except current record)
    if (dto.name) {
      const nameExists = await this.branchService.findByFields({
        where: { name: dto.name },
      });

      if (nameExists && nameExists.id !== id) {
        throw new BadRequestException(`Branch with name "${dto.name}" already exists`);
      }
    }

    dto.id = id;
    const entity = mapUpdateBranchDtoToEntity(dto);
    return this.branchService.update(entity, user?.email);
  }

  // ------------------------------------------------------------------------
  // DELETE
  // ------------------------------------------------------------------------
  @Delete('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete branch' })
  @ApiResponse({ status: 204, description: 'Branch deleted' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const existing = await this.branchService.findById(id);
    if (!existing) throw new NotFoundException(`Branch with id ${id} not found`);

    await this.branchService.delete(id);
  }
}
