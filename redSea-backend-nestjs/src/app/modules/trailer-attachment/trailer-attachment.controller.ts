// src/trailer-attachment/trailer-attachment.controller.ts
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
  Get,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard, Roles, RolesGuard, AuthUser } from 'src/core/security';
import { UserRole } from 'src/core/enums/user-role';

import { TrailerAttachmentService } from './trailer-attachment.service';
import { TrailerService } from '../trailer/trailer.service';

import { TrailerAttachmentDTO } from './dtos/trailer-attachment.dto';
import { CreateTrailerAttachmentDTO } from './dtos/create-trailer-attachment.dto';
import { UpdateTrailerAttachmentDTO } from './dtos/update-trailer-attachment.dto';

import {
  mapTrailerAttachmentToDtoSelective,
  mapCreateTrailerAttachmentDtoToEntity,
  mapUpdateTrailerAttachmentDtoToEntity,
} from './trailer-attachment.mapper';

@Controller('api/trailer-attachments')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('trailer-attachments-module')
export class TrailerAttachmentController {
  logger = new Logger('TrailerAttachmentController');

  constructor(
    private readonly attachmentService: TrailerAttachmentService,
    private readonly trailerService: TrailerService,
  ) {}

  // ----------------------------------------------------------------------
  // GET BY ID
  // ----------------------------------------------------------------------
  @Get('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get trailer attachment by ID' })
  @ApiResponse({ status: 200, description: 'Trailer attachment found', type: TrailerAttachmentDTO })
  async getById(@Param('id', ParseIntPipe) id: number): Promise<Partial<TrailerAttachmentDTO>> {
    const existing = await this.attachmentService.findById(id);
    if (!existing) throw new NotFoundException(`Trailer attachment with id ${id} not found`);

    return mapTrailerAttachmentToDtoSelective(existing, [
      'id',
      'trailer',
      'type',
      'documentExpiryDate',
      'url',
      'notes',
      'createdAt',
      'createdBy',
    ]);
  }

  // ----------------------------------------------------------------------
  // CREATE
  // ----------------------------------------------------------------------
  @Post('/')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new trailer attachment' })
  @ApiResponse({
    status: 201,
    description: 'Trailer attachment created',
    type: TrailerAttachmentDTO,
  })
  async create(
    @Body() dto: CreateTrailerAttachmentDTO,
    @AuthUser() user: any,
  ): Promise<Partial<TrailerAttachmentDTO>> {
    const trailer = await this.trailerService.findByFields({ where: { id: dto.trailerId } });
    if (!trailer) throw new NotFoundException(`Trailer with id ${dto.trailerId} not found`);

    const mapped = mapCreateTrailerAttachmentDtoToEntity(dto);
    const saved = await this.attachmentService.save(mapped, user?.email);

    return mapTrailerAttachmentToDtoSelective(saved);
  }

  // ----------------------------------------------------------------------
  // UPDATE
  // ----------------------------------------------------------------------
  @Put('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update trailer attachment' })
  @ApiResponse({
    status: 200,
    description: 'Trailer attachment updated',
    type: TrailerAttachmentDTO,
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTrailerAttachmentDTO,
    @AuthUser() user: any,
  ): Promise<Partial<TrailerAttachmentDTO>> {
    const existing = await this.attachmentService.findById(id);
    if (!existing) throw new NotFoundException(`Trailer attachment with id ${id} not found`);

    dto.id = id;
    const mapped = mapUpdateTrailerAttachmentDtoToEntity(dto);
    const updated = await this.attachmentService.update(mapped, user?.email);

    return mapTrailerAttachmentToDtoSelective(updated);
  }

  // ----------------------------------------------------------------------
  // DELETE
  // ----------------------------------------------------------------------
  @Delete('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete trailer attachment' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const existing = await this.attachmentService.findById(id);
    if (!existing) throw new NotFoundException(`Trailer attachment with id ${id} not found`);
    await this.attachmentService.delete(existing.id);
  }
}
