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
import { MaintenanceService } from './maintenance.service';
import { MaintenanceDTO } from './dtos/maintenance.dto';
import { CreateMaintenanceDTO } from './dtos/create-maintenance.dto';
import { UpdateMaintenanceDTO } from './dtos/update-maintenance.dto';
import { QueryMaintenanceDTO } from './dtos/query-maintenance.dto';
import {
  mapCreateMaintenanceDtoToEntity,
  mapMaintenanceToDtoSelective,
  mapUpdateMaintenanceDtoToEntity,
} from './maintenance.mapper';
import { Car } from '../car/car.entity';
import { Trailer } from '../trailer/trailer.entity';

@Controller('api/maintenances')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('maintenances-module')
export class MaintenanceController {
  logger = new Logger('MaintenanceController');

  constructor(
    private readonly maintenanceService: MaintenanceService,
    @InjectRepository(Car) private readonly carRepository: Repository<Car>,
    @InjectRepository(Trailer) private readonly trailerRepository: Repository<Trailer>,
  ) {}

  @Get('/')
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.DATA_ENTRY)
  @ApiOperation({ summary: 'List maintenances filtered by carId or trailerId' })
  @ApiResponse({ status: 200, type: MaintenanceDTO, isArray: true })
  async getAll(@Req() req: Request, @Query() query: QueryMaintenanceDTO) {
    const [results, count] = await this.maintenanceService.findAndCount(query);
    HeaderUtil.addPaginationHeaders(req.res!, count, +(query.page ?? 1), false);
    return results.map((m) => mapMaintenanceToDtoSelective(m));
  }

  @Get('/:id')
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.DATA_ENTRY)
  @ApiOperation({ summary: 'Get maintenance by id' })
  @ApiResponse({ status: 200, type: MaintenanceDTO })
  async getById(@Param('id', ParseIntPipe) id: number) {
    const existing = await this.maintenanceService.findById(id);
    if (!existing) throw new NotFoundException(`Maintenance with id ${id} not found`);
    return mapMaintenanceToDtoSelective(existing);
  }

  @Post('/')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create maintenance' })
  @ApiResponse({ status: 201, type: MaintenanceDTO })
  async create(@Body() dto: CreateMaintenanceDTO, @AuthUser() user: any) {
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

    const mapped = mapCreateMaintenanceDtoToEntity(dto);
    const saved = await this.maintenanceService.save(mapped, user?.email);
    return mapMaintenanceToDtoSelective(saved);
  }

  @Put('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update maintenance' })
  @ApiResponse({ status: 200, type: MaintenanceDTO })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMaintenanceDTO,
    @AuthUser() user: any,
  ) {
    const existing = await this.maintenanceService.findById(id);
    if (!existing) throw new NotFoundException(`Maintenance with id ${id} not found`);

    dto.id = id;
    const mapped = mapUpdateMaintenanceDtoToEntity(dto);
    const merged = Object.assign(existing, mapped);
    const updated = await this.maintenanceService.update(merged, user?.email);
    return mapMaintenanceToDtoSelective(updated);
  }

  @Delete('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete maintenance' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const existing = await this.maintenanceService.findById(id);
    if (!existing) throw new NotFoundException(`Maintenance with id ${id} not found`);
    await this.maintenanceService.delete(existing.id);
  }
}
