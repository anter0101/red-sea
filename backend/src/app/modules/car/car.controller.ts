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
import { PageRequest, pageRequestSortString } from 'src/core/utils/pagination.entity';

import { CarService } from './car.service';

import { CarDTO } from './dtos/car.dto';
import { CarStatsDTO } from './dtos/car-stats.dto';
import { CreateCarDTO } from './dtos/create-car.dto';
import { UpdateCarDTO } from './dtos/update-car.dto';
import { CarQueryDTO } from './dtos/query-car.dto';

import {
  mapCarToCarDtoSelective,
  mapCreateCarDtoToEntity,
  applyUpdateCarDtoToEntity,
} from './car.mapper';

@Controller('api/cars')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('cars-module')
export class CarController {
  logger = new Logger('CarController');

  constructor(private readonly carService: CarService) {}

  // ----------------------------------------------------------------------
  // GET ALL (PAGINATED)
  // ----------------------------------------------------------------------
  @Get('/')
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.DATA_ENTRY)
  @ApiOperation({ summary: 'Get list of cars (paginated)' })
  @ApiResponse({ status: 200, description: 'List all cars', type: CarDTO, isArray: true })
  async getAllCars(@Req() req: Request, @Query() query: CarQueryDTO): Promise<Partial<CarDTO>[]> {
    const pageRequest: PageRequest = new PageRequest(
      +(query.page ?? 1),
      +(query.pageSize ?? 10),
      pageRequestSortString(query.sortField, query.sortOrder),
    );

    const [results, count] = await this.carService.findAndCount(
      {
        skip: +pageRequest.page * pageRequest.size,
        take: +pageRequest.size,
        order: pageRequest.sort.asOrder(),
      },
      query,
    );

    const carDtos = mapCarToCarDtoSelective(results, [
      'id',
      'code',
      'manufacturer',
      'model',
      'status',
      'manufactureYear',
      'color',
      'axleCount',
      'maxWeight',
      'plateNumber',
      'plateLetters',
      'chassisNumber',
      'horsepower',
      'cylinders',
      'licenseNumber',
      'licenseExpiryDate',
      'ownerShip',
      'axles',
      'notes',
      'createdAt',
      'createdBy',
    ]);

    // Pagination Headers
    req.res!.setHeader('X-Total-Count', count);
    req.res!.setHeader('X-Page', pageRequest.page);
    req.res!.setHeader(
      'X-Has-Next-Page',
      count > pageRequest.page * pageRequest.size ? 'true' : 'false',
    );

    return carDtos;
  }

  // ----------------------------------------------------------------------
  // STATS
  // ----------------------------------------------------------------------
  @Get('/stats')
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.DATA_ENTRY)
  @ApiOperation({ summary: 'Car list KPI counts by status and ownership' })
  @ApiResponse({ status: 200, description: 'Car stats', type: CarStatsDTO })
  async getCarStats(): Promise<CarStatsDTO> {
    return this.carService.getStats();
  }

  // ----------------------------------------------------------------------
  // GET BY ID
  // ----------------------------------------------------------------------
  @Get('/:id')
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.DATA_ENTRY)
  @ApiOperation({ summary: 'Get car by ID' })
  @ApiResponse({ status: 200, description: 'Car found', type: CarDTO })
  async getCarById(@Param('id', ParseIntPipe) id: number): Promise<Partial<CarDTO>> {
    const existing = await this.carService.find({
      where: { id },
      relations: ['axles', 'carAttachments', 'Ownerships', 'Ownerships.owner', 'axles.tires'], // match entity names
    });

    if (!existing) throw new NotFoundException(`Car with id ${id} not found`);

    return mapCarToCarDtoSelective(existing, [
      'id',
      'code',
      'manufacturer',
      'model',
      'status',
      'manufactureYear',
      'color',
      'axleCount',
      'maxWeight',
      'plateNumber',
      'plateLetters',
      'horsepower',
      'cylinders',
      'chassisNumber',
      'licenseNumber',
      'licenseExpiryDate',
      'ownerShip',
      'notes',
      'createdAt',
      'createdBy',
      'carAttachments',
      'axles', // now will appear
      'Ownerships',
    ]);
  }

  // ----------------------------------------------------------------------
  // CREATE
  // ----------------------------------------------------------------------
  @Post('/')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new car' })
  @ApiResponse({ status: 201, description: 'Car created', type: CarDTO })
  async create(@Body() dto: CreateCarDTO, @AuthUser() user: any): Promise<CarDTO> {
    if (dto.chassisNumber) {
      const existingChassis = await this.carService.findByFields({
        where: { chassisNumber: dto.chassisNumber },
      });
      if (existingChassis) {
        throw new BadRequestException(
          `Car with chassis number ${dto.chassisNumber} already exists`,
        );
      }
    }

    const existingPlate = await this.carService.findByFields({
      where: { plateNumber: dto.plateNumber, plateLetters: dto.plateLetters },
    });
    if (existingPlate) {
      throw new BadRequestException(
        `Car with plate ${dto.plateLetters} ${dto.plateNumber} already exists`,
      );
    }

    const mapped = mapCreateCarDtoToEntity(dto);
    return this.carService.save(mapped, user?.email);
  }

  // ----------------------------------------------------------------------
  // UPDATE
  // ----------------------------------------------------------------------
  @Put('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update car' })
  @ApiResponse({ status: 200, description: 'Car updated', type: CarDTO })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCarDTO,
    @AuthUser() user: any,
  ): Promise<CarDTO> {
    const existing = await this.carService.find({ where: { id } });
    if (!existing) throw new NotFoundException(`Car with id ${id} not found`);

    dto.id = id;

    if (dto.code && dto.code !== existing.code) {
      const codeCheck = await this.carService.findByFields({ where: { code: dto.code } });
      if (codeCheck) throw new BadRequestException(`Car with code ${dto.code} already exists`);
    }

    if (dto.chassisNumber && dto.chassisNumber !== existing.chassisNumber) {
      const chassisCheck = await this.carService.findByFields({
        where: { chassisNumber: dto.chassisNumber },
      });
      if (chassisCheck) {
        throw new BadRequestException(
          `Car with chassis number ${dto.chassisNumber} already exists`,
        );
      }
    }

    if (
      (dto.plateNumber && dto.plateNumber !== existing.plateNumber) ||
      (dto.plateLetters && dto.plateLetters !== existing.plateLetters)
    ) {
      const plateCheck = await this.carService.findByFields({
        where: {
          plateNumber: dto.plateNumber ?? existing.plateNumber,
          plateLetters: dto.plateLetters ?? existing.plateLetters,
        },
      });
      if (plateCheck && plateCheck.id !== id) {
        throw new BadRequestException(
          `Car with plate ${dto.plateLetters ?? existing.plateLetters} ${dto.plateNumber ?? existing.plateNumber} already exists`,
        );
      }
    }

    applyUpdateCarDtoToEntity(dto, existing);
    return this.carService.update(existing, user?.email);
  }

  // ----------------------------------------------------------------------
  // DELETE
  // ----------------------------------------------------------------------
  @Delete('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Soft delete car' })
  async delete(@Param('id', ParseIntPipe) id: number, @AuthUser() user: any): Promise<void> {
    const existing = await this.carService.findById(id);
    if (!existing) throw new NotFoundException(`Car with id ${id} not found`);
    await this.carService.softDelete(existing.id, user?.email);
  }
}
