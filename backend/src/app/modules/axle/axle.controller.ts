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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard, Roles, RolesGuard, AuthUser } from 'src/core/security';
import { UserRole } from 'src/core/enums/user-role';
import { AxleService } from './axle.service';
import { AxleDTO } from './dtos/axle.dto';
import { CreateAxleDTO } from './dtos/create-axle.dto';
import { UpdateAxleDTO } from './dtos/update-axle.dto';
import { mapCreateAxleDtoToEntity, mapUpdateAxleDtoToEntity } from './axle.mapper';
import { UserDTO } from '../user/dtos/user.dto';
import { CarService } from '../car/car.service';
import { TrailerService } from '../trailer/trailer.service';
import { Axle } from './axle.entity';

@Controller('api/axles')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('axles-module')
export class AxleController {
  logger = new Logger('AxleController');

  constructor(
    private readonly axleService: AxleService,
    private readonly carService: CarService,
    private readonly trailerService: TrailerService,
  ) {}

  // @Post('/')
  // @Roles(UserRole.ADMIN)
  // @ApiOperation({ summary: 'Create a new axle record' })
  // @ApiResponse({ status: 201, description: 'Record created', type: AxleDTO })
  // async create(@Body() createAxleDTO: CreateAxleDTO, @AuthUser() user: UserDTO): Promise<AxleDTO> {
  //   // Validate that either carId or trailerId is provided, but not both
  //   if (!createAxleDTO.carId && !createAxleDTO.trailerId) {
  //     throw new BadRequestException('Either carId or trailerId must be provided');
  //   }

  //   if (createAxleDTO.carId && createAxleDTO.trailerId) {
  //     throw new BadRequestException('Cannot assign axle to both car and trailer');
  //   }

  //   // Validate parent entity exists
  //   if (createAxleDTO.carId) {
  //     const existingCar = await this.carService.findByFields({
  //       where: { id: createAxleDTO.carId },
  //     });

  //     if (!existingCar) {
  //       throw new BadRequestException(`Car with id ${createAxleDTO.carId} does not exist`);
  //     }
  //   }

  //   if (createAxleDTO.trailerId) {
  //     const existingTrailer = await this.trailerService.findByFields({
  //       where: { id: createAxleDTO.trailerId },
  //     });

  //     if (!existingTrailer) {
  //       throw new BadRequestException(`Trailer with id ${createAxleDTO.trailerId} does not exist`);
  //     }
  //   }

  //   const mappedAxle = mapCreateAxleDtoToEntity(createAxleDTO) as Axle;

  //   return this.axleService.save(mappedAxle, user?.email);
  // }

  @Post('/')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Bulk create axle records' })
  @ApiResponse({ status: 201, description: 'Records created', type: [AxleDTO] })
  async bulkCreate(@Body() dtos: CreateAxleDTO[], @AuthUser() user: UserDTO): Promise<AxleDTO[]> {
    if (!Array.isArray(dtos) || dtos.length === 0) {
      throw new BadRequestException('Request body must be a non-empty array');
    }

    const results: Axle[] = [];

    for (const dto of dtos) {
      // Validate either carId or trailerId
      if (!dto.carId && !dto.trailerId) {
        throw new BadRequestException('Each axle must include either carId or trailerId');
      }

      if (dto.carId && dto.trailerId) {
        throw new BadRequestException('Axle cannot be assigned to both car and trailer');
      }

      // Validate parent entity exists
      if (dto.carId) {
        const car = await this.carService.findByFields({
          where: { id: dto.carId },
        });
        if (!car) {
          throw new BadRequestException(`Car with id ${dto.carId} does not exist`);
        }
      }

      if (dto.trailerId) {
        const trailer = await this.trailerService.findByFields({
          where: { id: dto.trailerId },
        });
        if (!trailer) {
          throw new BadRequestException(`Trailer with id ${dto.trailerId} does not exist`);
        }
      }

      // Map DTO → entity
      const mappedAxle = mapCreateAxleDtoToEntity(dto) as Axle;
      results.push(mappedAxle);
    }

    // Save all records
    return this.axleService.saveBulk(results, user?.email);
  }

  @Put('/')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Bulk update axle records' })
  @ApiResponse({ status: 200, description: 'Records updated', type: [AxleDTO] })
  async bulkUpdate(@Body() dtos: UpdateAxleDTO[], @AuthUser() user: any): Promise<AxleDTO[]> {
    if (!Array.isArray(dtos) || dtos.length === 0) {
      throw new BadRequestException('Request body must be a non-empty array');
    }

    const results: Axle[] = [];

    for (const dto of dtos) {
      if (!dto.id) {
        throw new BadRequestException('Each axle must include an id for update');
      }

      const existing = await this.axleService.findById(dto.id);
      if (!existing) {
        throw new NotFoundException(`Axle with id ${dto.id} not found`);
      }

      const mappedAxle = mapUpdateAxleDtoToEntity(dto);
      results.push(mappedAxle);
    }

    return this.axleService.updateBulk(results, user?.email);
  }

  @Put('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update existing axle record' })
  @ApiResponse({ status: 200, description: 'Record updated', type: AxleDTO })
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateAxleDTO,
    @AuthUser() user: any,
  ): Promise<UpdateAxleDTO> {
    const existing = await this.axleService.findById(id);
    if (!existing) throw new NotFoundException(`Axle with id ${id} not found`);

    dto.id = id;

    const mappedAxle = mapUpdateAxleDtoToEntity(dto);

    return this.axleService.update(mappedAxle, user?.email);
  }

  @Delete('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete axle record' })
  async delete(@Param('id') id: number): Promise<void> {
    const existing = await this.axleService.findById(id);
    if (!existing) throw new NotFoundException(`Axle with id ${id} not found`);

    await this.axleService.delete(existing.id);
  }
}
