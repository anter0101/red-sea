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

import { CarAttachmentService } from './car-attachment.service';
import { CarService } from '../car/car.service';

import { CarAttachmentDTO } from './dtos/car-attachment.dto';
import { CreateCarAttachmentDTO } from './dtos/create-car-attachment.dto';
import { UpdateCarAttachmentDTO } from './dtos/update-car-attachment.dto';

import {
  mapCarAttachmentToDtoSelective,
  mapCreateCarAttachmentDtoToEntity,
  mapUpdateCarAttachmentDtoToEntity,
} from './car-attachment.mapper';

@Controller('api/car-attachments')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('car-attachments-module')
export class CarAttachmentController {
  logger = new Logger('CarAttachmentController');

  constructor(
    private readonly attachmentService: CarAttachmentService,
    private readonly carService: CarService,
  ) {}

  // ----------------------------------------------------------------------
  // GET BY ID
  // ----------------------------------------------------------------------
  @Get('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get car attachment by ID' })
  @ApiResponse({ status: 200, description: 'Car attachment found', type: CarAttachmentDTO })
  async getById(@Param('id', ParseIntPipe) id: number): Promise<Partial<CarAttachmentDTO>> {
    const existing = await this.attachmentService.findById(id);
    if (!existing) throw new NotFoundException(`Car attachment with id ${id} not found`);

    return mapCarAttachmentToDtoSelective(existing, [
      'id',
      'car',
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
  @ApiOperation({ summary: 'Create a new car attachment' })
  @ApiResponse({
    status: 201,
    description: 'Car attachment created',
    type: CarAttachmentDTO,
  })
  async create(
    @Body() dto: CreateCarAttachmentDTO,
    @AuthUser() user: any,
  ): Promise<Partial<CarAttachmentDTO>> {
    const car = await this.carService.findByFields({ where: { id: dto.carId } });
    if (!car) throw new NotFoundException(`Car with id ${dto.carId} not found`);

    const mapped = mapCreateCarAttachmentDtoToEntity(dto);
    const saved = await this.attachmentService.save(mapped, user?.email);

    return mapCarAttachmentToDtoSelective(saved);
  }

  // ----------------------------------------------------------------------
  // UPDATE
  // ----------------------------------------------------------------------
  @Put('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update car attachment' })
  @ApiResponse({
    status: 200,
    description: 'Car attachment updated',
    type: CarAttachmentDTO,
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCarAttachmentDTO,
    @AuthUser() user: any,
  ): Promise<Partial<CarAttachmentDTO>> {
    const existing = await this.attachmentService.findById(id);
    if (!existing) throw new NotFoundException(`Car attachment with id ${id} not found`);

    dto.id = id;
    const mapped = mapUpdateCarAttachmentDtoToEntity(dto);
    const updated = await this.attachmentService.update(mapped, user?.email);

    return mapCarAttachmentToDtoSelective(updated);
  }

  // ----------------------------------------------------------------------
  // DELETE
  // ----------------------------------------------------------------------
  @Delete('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete car attachment' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const existing = await this.attachmentService.findById(id);
    if (!existing) throw new NotFoundException(`Car attachment with id ${id} not found`);
    await this.attachmentService.delete(existing.id);
  }
}
