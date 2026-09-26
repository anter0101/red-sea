// src/trailer/trailer.controller.ts
import {
  Controller,
  Logger,
  UseGuards,
  Post,
  Put,
  Delete,
  Get,
  Body,
  Param,
  NotFoundException,
  BadRequestException,
  Req,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard, Roles, RolesGuard, AuthUser } from 'src/core/security';
import { UserRole } from 'src/core/enums/user-role';
import type { Request } from 'src/core/utils/request';
import { PageRequest, pageRequestSortString } from 'src/core/utils/pagination.entity';

import { TrailerService } from './trailer.service';
import { AxleService } from '../axle/axle.service';

import { TrailerDTO } from './dtos/trailer.dto';
import { TrailerStatsDTO } from './dtos/trailer-stats.dto';
import { CreateTrailerDTO } from './dtos/create-trailer.dto';
import { UpdateTrailerDTO } from './dtos/update-trailer.dto';
import { QueryTrailerDto } from './dtos/query-trailer.dto';

import {
  mapTrailerToTrailerDtoSelective,
  mapCreateTrailerDtoToEntity,
  mapUpdateTrailerDtoToEntity,
} from './trailer.mapper';

@Controller('api/trailers')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('trailers-module')
export class TrailerController {
  logger = new Logger('TrailerController');

  constructor(
    private readonly trailerService: TrailerService,
    private readonly axleService: AxleService,
  ) {}

  // ----------------------------------------------------------------------
  // GET ALL (PAGINATED)
  // ----------------------------------------------------------------------
  @Get('/')
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.DATA_ENTRY)
  @ApiOperation({ summary: 'Get list of trailers (paginated)' })
  @ApiResponse({ status: 200, description: 'List all trailers', type: TrailerDTO, isArray: true })
  async getAllTrailers(
    @Req() req: Request,
    @Query() query: QueryTrailerDto,
  ): Promise<Partial<TrailerDTO>[]> {
    const pageRequest: PageRequest = new PageRequest(
      +(query.page ?? 1),
      +(query.pageSize ?? 10),
      pageRequestSortString(query.sortField, query.sortOrder),
    );

    const [results, count] = await this.trailerService.findAndCount(
      {
        skip: pageRequest.page * pageRequest.size,
        take: pageRequest.size,
        order: pageRequest.sort.asOrder(),
      },
      query,
    );

    const trailerDtos = mapTrailerToTrailerDtoSelective(results, [
      'id',
      'code',
      'chaseType',
      'manufacturer',
      'status',
      'manufactureYear',
      'color',
      'maxWeight',
      'plateNumber',
      'plateLetters',
      'chassisNumber',
      'licenseNumber',
      'licenseExpiryDate',
      'notes',
      'ownerShip',
      'Ownerships',
      'createdAt',
      'createdBy',
      'updatedAt',
      'updatedBy',
    ]);

    // Pagination Headers
    req.res!.setHeader('X-Total-Count', count);
    req.res!.setHeader('X-Page', pageRequest.page);
    req.res!.setHeader(
      'X-Has-Next-Page',
      count > pageRequest.page * pageRequest.size ? 'true' : 'false',
    );

    return trailerDtos;
  }

  // ----------------------------------------------------------------------
  // STATS
  // ----------------------------------------------------------------------
  @Get('/stats')
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.DATA_ENTRY)
  @ApiOperation({ summary: 'Trailer list KPI counts by status and ownership' })
  @ApiResponse({ status: 200, description: 'Trailer stats', type: TrailerStatsDTO })
  async getTrailerStats(): Promise<TrailerStatsDTO> {
    return this.trailerService.getStats();
  }

  // ----------------------------------------------------------------------
  // GET BY ID
  // ----------------------------------------------------------------------
  @Get('/:id')
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.DATA_ENTRY)
  @ApiOperation({ summary: 'Get trailer by id' })
  @ApiResponse({ status: 200, description: 'Trailer found', type: TrailerDTO })
  async getTrailerById(@Param('id', ParseIntPipe) id: number): Promise<Partial<TrailerDTO>> {
    const existing = await this.trailerService.find({
      where: { id },
      relations: ['axles', 'trailerAttachments', 'Ownerships', 'axles.tires', 'Ownerships.owner'], // match entity names
    });

    if (!existing) throw new NotFoundException(`Trailer with id ${id} not found`);

    return mapTrailerToTrailerDtoSelective(existing, [
      'id',
      'code',
      'chaseType',
      'manufacturer',
      'status',
      'manufactureYear',
      'color',
      'maxWeight',
      'plateNumber',
      'plateLetters',
      'chassisNumber',
      'licenseNumber',
      'licenseExpiryDate',
      'axleCount',
      'notes',
      'ownerShip',
      'axles',
      'Ownerships',
      'trailerAttachments',
      'createdAt',
      'createdBy',
      'updatedAt',
      'updatedBy',
    ]);
  }
  // ----------------------------------------------------------------------
  // CREATE
  // ----------------------------------------------------------------------
  @Post('/')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new trailer' })
  @ApiResponse({ status: 201, description: 'Trailer created', type: TrailerDTO })
  async create(@Body() dto: CreateTrailerDTO, @AuthUser() user: any): Promise<Partial<TrailerDTO>> {
    // Validate axles exist
    if (dto.axles && dto.axles.length > 0) {
      for (const axleId of dto.axles) {
        const axle = await this.axleService.findByFields({ where: { id: axleId } });
        if (!axle) {
          throw new BadRequestException(`Axle with id ${axleId} does not exist`);
        }
      }
    }

    if (dto.chassisNumber) {
      const existingChassis = await this.trailerService.findByFields({
        where: { chassisNumber: dto.chassisNumber },
      });
      if (existingChassis) {
        throw new BadRequestException(
          `Trailer with chassis number ${dto.chassisNumber} already exists`,
        );
      }
    }

    const existingPlate = await this.trailerService.findByFields({
      where: { plateNumber: dto.plateNumber, plateLetters: dto.plateLetters },
    });
    if (existingPlate) {
      throw new BadRequestException(
        `Trailer with plate ${dto.plateLetters} ${dto.plateNumber} already exists`,
      );
    }

    const mapped = mapCreateTrailerDtoToEntity(dto);
    const saved = await this.trailerService.save(mapped, user?.email);

    return mapTrailerToTrailerDtoSelective(saved, [
      'id',
      'code',
      'chaseType',
      'manufacturer',
      'status',
      'manufactureYear',
      'color',
      'maxWeight',
      'plateNumber',
      'plateLetters',
      'chassisNumber',
      'licenseNumber',
      'licenseExpiryDate',
      'ownerShip',
      'axles',
      'notes',
      'createdAt',
      'createdBy',
      'updatedAt',
      'updatedBy',
    ]);
  }

  // ----------------------------------------------------------------------
  // UPDATE
  // ----------------------------------------------------------------------
  @Put('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update trailer' })
  @ApiResponse({ status: 200, description: 'Trailer updated', type: TrailerDTO })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTrailerDTO,
    @AuthUser() user: any,
  ): Promise<Partial<TrailerDTO>> {
    const existing = await this.trailerService.findById(id);
    if (!existing) throw new NotFoundException(`Trailer with id ${id} not found`);

    dto.id = id;

    // UNIQUE: code
    if (dto.code && dto.code !== existing.code) {
      const codeCheck = await this.trailerService.findByFields({ where: { code: dto.code } });
      if (codeCheck) throw new BadRequestException(`Trailer with code ${dto.code} already exists`);
    }

    if (dto.chassisNumber && dto.chassisNumber !== existing.chassisNumber) {
      const chassisCheck = await this.trailerService.findByFields({
        where: { chassisNumber: dto.chassisNumber },
      });
      if (chassisCheck && chassisCheck.id !== id) {
        throw new BadRequestException(
          `Trailer with chassis number ${dto.chassisNumber} already exists`,
        );
      }
    }

    if (
      (dto.plateNumber && dto.plateNumber !== existing.plateNumber) ||
      (dto.plateLetters && dto.plateLetters !== existing.plateLetters)
    ) {
      const plateCheck = await this.trailerService.findByFields({
        where: {
          plateNumber: dto.plateNumber ?? existing.plateNumber,
          plateLetters: dto.plateLetters ?? existing.plateLetters,
        },
      });
      if (plateCheck && plateCheck.id !== id) {
        throw new BadRequestException(
          `Trailer with plate ${dto.plateLetters ?? existing.plateLetters} ${dto.plateNumber ?? existing.plateNumber} already exists`,
        );
      }
    }

    // Validate axles exist
    if (dto.axles) {
      for (const axleId of dto.axles) {
        const axle = await this.axleService.findByFields({ where: { id: axleId } });
        if (!axle) {
          throw new BadRequestException(`Axle with id ${axleId} does not exist`);
        }
      }
    }

    const mapped = mapUpdateTrailerDtoToEntity(dto);
    const updated = await this.trailerService.update(mapped, user?.email);

    return updated;
  }

  // ----------------------------------------------------------------------
  // DELETE
  // ----------------------------------------------------------------------
  @Delete('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Soft delete trailer' })
  async delete(@Param('id', ParseIntPipe) id: number, @AuthUser() user: any): Promise<void> {
    const existing = await this.trailerService.findById(id);
    if (!existing) throw new NotFoundException(`Trailer with id ${id} not found`);
    await this.trailerService.softDelete(existing.id, user?.email);
  }
}
