import {
  Controller,
  Logger,
  UseGuards,
  Param,
  NotFoundException,
  Get,
  Req,
  Query,
  ParseIntPipe,
  Put,
  Body,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard, Roles, RolesGuard } from 'src/core/security';
import { UserRole } from 'src/core/enums/user-role';
import type { Request } from 'src/core/utils/request';

import { GpsDeviceService } from './gps-device.service';
import { GpsDeviceDTO } from './dtos/gps-device.dto';
import { GpsDeviceQueryDTO } from './dtos/query-gps-device.dto';

import { PageRequest, pageRequestSortString } from 'src/core/utils/pagination.entity';
import { HeaderUtil } from 'src/core/utils/header-util';

import {
  mapGpsDeviceToDtoSelective,
  mapGpsItemsTODB,
  mapUpdateGpsDeviceDtoToEntity,
} from './gps-device.mapper';
import { UpdateGpsDeviceDTO } from './dtos/update-gps-device.dto';
import { CarService } from '../car/car.service';

@Controller('api/gps-devices')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('gps-devices-module')
export class GpsDeviceController {
  private readonly logger = new Logger('GpsDeviceController');

  constructor(
    private readonly gpsDeviceService: GpsDeviceService,
    private readonly carService: CarService,
  ) {}

  @Get('/')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get list of GPS devices paginated' })
  @ApiResponse({
    status: 200,
    description: 'List of GPS devices',
    type: GpsDeviceDTO,
    isArray: true,
  })
  async getAll(
    @Req() req: Request,
    @Query() query: GpsDeviceQueryDTO,
  ): Promise<Partial<GpsDeviceDTO>[]> {
    const pageRequest = new PageRequest(
      +(query.page ?? 1),
      +(query.pageSize ?? 10),
      pageRequestSortString(query.sortField, query.sortOrder),
    );

    const [results, count] = await this.gpsDeviceService.findAndCount(
      {
        skip: +pageRequest.page * pageRequest.size,
        take: +pageRequest.size,
        order: pageRequest.sort.asOrder(),
        relations: ['car'],
      },
      query,
    );

    const dtos = mapGpsDeviceToDtoSelective(results, [
      'id',
      'name',
      'imei',
      'lastLatitude',
      'car',
      'lastLongitude',
      'speed',
      'totalDistance',
      'batteryLevel',
      'signalStrength',
      'engineStatus',
      'lastUpdate',
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
  @Get('/sync')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Sync GPS devices from external GPS API' })
  @ApiResponse({ status: 200, description: 'Devices synced', type: GpsDeviceDTO, isArray: true })
  async sync(): Promise<GpsDeviceDTO[]> {
    const externalData = await this.gpsDeviceService.getDevicesfromGps();
    if (!externalData) throw new NotFoundException('Gps connection error');

    const mappedDevices = mapGpsItemsTODB(externalData);
    const syncedDevices = await this.gpsDeviceService.syncDevices(mappedDevices);
    if (!syncedDevices) throw new NotFoundException('Gps connection error');

    return mapGpsDeviceToDtoSelective(syncedDevices) as GpsDeviceDTO[];
  }
  @Get('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get GPS device by id' })
  @ApiResponse({ status: 200, description: 'GPS Device found', type: GpsDeviceDTO })
  async getById(@Param('id', ParseIntPipe) id: number): Promise<GpsDeviceDTO> {
    const existing = await this.gpsDeviceService.findByFields({
      where: { id },
      relations: ['car', 'gpsTail'],
    });
    if (!existing) throw new NotFoundException(`GpsDevice with id ${id} not found`);

    return mapGpsDeviceToDtoSelective(existing, [
      'id',
      'name',
      'imei',
      'lastLatitude',
      'lastLongitude',
      'speed',
      'totalDistance',
      'car',
      'gpsTail',
      'batteryLevel',
      'signalStrength',
      'engineStatus',
      'lastUpdate',
      'createdBy',
      'updatedBy',
      'createdAt',
      'updatedAt',
    ]) as GpsDeviceDTO;
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update GPS device' }) // Adjusted summary for accuracy
  @ApiResponse({ status: 200, description: 'GPS Device updated', type: GpsDeviceDTO })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() gpsDevice: UpdateGpsDeviceDTO,
  ): Promise<GpsDeviceDTO> {
    const existing = await this.gpsDeviceService.findByFields({
      where: { id },
    });
    if (!existing) throw new NotFoundException(`GpsDevice with id ${id} not found`);

    if (gpsDevice.carId) {
      const car = await this.carService.findById(gpsDevice.carId);
      if (!car) throw new NotFoundException(`Car with id ${gpsDevice.carId} not found`);

      if (gpsDevice.carId !== existing.car?.id) {
        const otherGps = await this.gpsDeviceService.findByFields({
          where: { car: { id: gpsDevice.carId } },
        });
        if (otherGps && otherGps.id !== existing.id) {
          otherGps.car = null;
          await this.gpsDeviceService.save(otherGps);
        }
      }
    }

    const mapped = mapUpdateGpsDeviceDtoToEntity(gpsDevice, existing);
    const updated = await this.gpsDeviceService.save(mapped);
    return mapGpsDeviceToDtoSelective(updated) as GpsDeviceDTO;
  }
}
