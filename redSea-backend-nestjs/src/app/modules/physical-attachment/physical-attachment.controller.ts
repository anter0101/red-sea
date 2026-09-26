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
import { InjectRepository } from '@nestjs/typeorm';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Repository } from 'typeorm';
import { AuthGuard, AuthUser, Roles, RolesGuard } from 'src/core/security';
import { UserRole } from 'src/core/enums/user-role';
import type { Request } from 'src/core/utils/request';
import { HeaderUtil } from 'src/core/utils/header-util';
import { PhysicalAttachmentService } from './physical-attachment.service';
import { PhysicalAttachmentDTO } from './dtos/physical-attachment.dto';
import { CreatePhysicalAttachmentDTO } from './dtos/create-physical-attachment.dto';
import { UpdatePhysicalAttachmentDTO } from './dtos/update-physical-attachment.dto';
import { QueryPhysicalAttachmentDTO } from './dtos/query-physical-attachment.dto';
import {
  mapCreatePhysicalAttachmentDtoToEntity,
  mapPhysicalAttachmentToDtoSelective,
  mapUpdatePhysicalAttachmentDtoToEntity,
} from './physical-attachment.mapper';
import { Car } from '../car/car.entity';
import { Trailer } from '../trailer/trailer.entity';

@Controller('api/physical-attachments')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('physical-attachments-module')
export class PhysicalAttachmentController {
  logger = new Logger('PhysicalAttachmentController');

  constructor(
    private readonly attachmentService: PhysicalAttachmentService,
    @InjectRepository(Car) private readonly carRepository: Repository<Car>,
    @InjectRepository(Trailer) private readonly trailerRepository: Repository<Trailer>,
  ) {}

  @Get('/')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get list of physical attachments (filtered by carId or trailerId)' })
  @ApiResponse({
    status: 200,
    description: 'List of physical attachments',
    type: PhysicalAttachmentDTO,
    isArray: true,
  })
  async getAll(@Req() req: Request, @Query() query: QueryPhysicalAttachmentDTO) {
    const [results, count] = await this.attachmentService.findAndCount(query);
    HeaderUtil.addPaginationHeaders(req.res!, count, +(query.page ?? 1), false);
    return results.map((a) => mapPhysicalAttachmentToDtoSelective(a));
  }

  @Get('/:id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get physical attachment by ID' })
  @ApiResponse({ status: 200, description: 'Physical attachment found', type: PhysicalAttachmentDTO })
  async getById(@Param('id', ParseIntPipe) id: number): Promise<Partial<PhysicalAttachmentDTO>> {
    const existing = await this.attachmentService.findById(id);
    if (!existing) throw new NotFoundException(`Physical attachment with id ${id} not found`);

    return mapPhysicalAttachmentToDtoSelective(existing, [
      'id',
      'name',
      'date',
      'description',
      'photoUrl',
      'price',
      'car',
      'trailer',
      'createdAt',
      'createdBy',
    ]);
  }

  @Post('/')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a physical attachment' })
  @ApiResponse({
    status: 201,
    description: 'Physical attachment created',
    type: PhysicalAttachmentDTO,
  })
  async create(
    @Body() dto: CreatePhysicalAttachmentDTO,
    @AuthUser() user: any,
  ): Promise<Partial<PhysicalAttachmentDTO>> {
    const hasCar = dto.carId != null;
    const hasTrailer = dto.trailerId != null;
    if (hasCar === hasTrailer) {
      throw new BadRequestException('Provide exactly one of carId or trailerId');
    }

    if (hasCar) {
      const car = await this.carRepository.findOne({ where: { id: dto.carId } });
      if (!car) throw new NotFoundException(`Car with id ${dto.carId} not found`);
    } else {
      const trailer = await this.trailerRepository.findOne({ where: { id: dto.trailerId } });
      if (!trailer) throw new NotFoundException(`Trailer with id ${dto.trailerId} not found`);
    }

    const mapped = mapCreatePhysicalAttachmentDtoToEntity(dto);
    const saved = await this.attachmentService.save(mapped, user?.email);

    return mapPhysicalAttachmentToDtoSelective(saved);
  }

  @Put('/:id')
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.DATA_ENTRY)
  @ApiOperation({ summary: 'Update physical attachment' })
  @ApiResponse({
    status: 200,
    description: 'Physical attachment updated',
    type: PhysicalAttachmentDTO,
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePhysicalAttachmentDTO,
    @AuthUser() user: any,
  ): Promise<Partial<PhysicalAttachmentDTO>> {
    const existing = await this.attachmentService.findById(id);
    if (!existing) throw new NotFoundException(`Physical attachment with id ${id} not found`);

    dto.id = id;
    if (dto.confirmedOk === true) {
      dto.confirmedBy = dto.confirmedBy ?? user?.email;
      dto.confirmedAt = dto.confirmedAt ?? (new Date() as any);
    }
    const mapped = mapUpdatePhysicalAttachmentDtoToEntity(dto);
    const merged = Object.assign(existing, mapped);
    const updated = await this.attachmentService.update(merged, user?.email);

    return mapPhysicalAttachmentToDtoSelective(updated);
  }

  @Delete('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete physical attachment' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const existing = await this.attachmentService.findById(id);
    if (!existing) throw new NotFoundException(`Physical attachment with id ${id} not found`);
    await this.attachmentService.delete(existing.id);
  }
}
