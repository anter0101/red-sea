import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, FindOneOptions, In, Not } from 'typeorm';
import { GpsDevice } from './gps-device.entity';
import { CreateGpsDeviceDTO } from './dtos/create-gps-device.dto';
import { mapCreateGpsDeviceDtoToEntity } from './gps-device.mapper';
import { mapGpsTailDtoToEntity } from '../gps-tail/gps-tail.mapper';
import { GpsTail } from '../gps-tail/gps-tail.entity';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { GpsDeviceQueryDTO } from './dtos/query-gps-device.dto';
import { applyQueryFilters } from 'src/core/utils/query-builder.util';
import { getStringColumns } from 'src/core/utils/entity-meta.util';
import { Car } from '../car/car.entity';
import { isGpsSyncEnabled } from './gps-sync.enabled';

@Injectable()
export class GpsDeviceService {
  private readonly logger = new Logger(GpsDeviceService.name);
  private apiBase = process.env.GPS_API_URL || 'https://gps.fmsgps.co/api';
  private hash = process.env.GPS_API_HashKey || '';
  constructor(
    @InjectRepository(GpsDevice)
    private readonly gpsDeviceRepository: Repository<GpsDevice>,
    private readonly httpService: HttpService,
  ) {}

  async findById(id: number): Promise<GpsDevice | undefined> {
    const result = await this.gpsDeviceRepository.findOne({ where: { id } });
    return result || undefined;
  }

  async findByFields(options: FindOneOptions<GpsDevice>): Promise<GpsDevice | undefined> {
    const result = await this.gpsDeviceRepository.findOne(options);
    return result || undefined;
  }

  async find(options: FindManyOptions<GpsDevice>): Promise<GpsDevice[] | undefined> {
    const result = await this.gpsDeviceRepository.find(options);
    return result || undefined;
  }

  async findAndCount(
    options: FindManyOptions<GpsDevice>,
    query?: GpsDeviceQueryDTO,
  ): Promise<[GpsDevice[], number]> {
    if (!query) return this.gpsDeviceRepository.findAndCount(options);

    const qb = this.gpsDeviceRepository
      .createQueryBuilder('gpsDevice')
      .leftJoinAndSelect('gpsDevice.car', 'car');

    applyQueryFilters(qb, query, {
      alias: 'gpsDevice',
      searchableFields: getStringColumns(GpsDevice),
      enumFilters: [],
      dateFields: ['createdAt', 'updatedAt'],
      relations: [
        {
          alias: 'car',
          searchableFields: getStringColumns(Car),
        },
      ],
    });

    return qb.getManyAndCount();
  }

  async save(device: GpsDevice, creator?: string): Promise<GpsDevice> {
    const now = new Date();
    device.createdAt = device.createdAt ?? now;
    device.updatedAt = now;
    if (creator) {
      device.createdBy = device.createdBy ?? creator;
      device.updatedBy = creator;
    }
    return await this.gpsDeviceRepository.save(device);
  }

  async update(device: GpsDevice, updater?: string): Promise<GpsDevice> {
    const now = new Date();
    device.updatedAt = now;
    if (updater) device.updatedBy = updater;
    return await this.gpsDeviceRepository.save(device);
  }

  async delete(id: number): Promise<void> {
    await this.gpsDeviceRepository.delete(id);
  }

  async syncDevices(dtos: CreateGpsDeviceDTO[]): Promise<GpsDevice[]> {
    if (!dtos.length) return [];

    const imeis = dtos.filter((d) => !!d.imei).map((d) => d.imei);

    const existingDevices = await this.gpsDeviceRepository.find({
      where: { imei: In(imeis) },
      relations: ['gpsTail'], // Load relations if needed for handling
    });

    const orphanedDevices =
      imeis.length > 0
        ? await this.gpsDeviceRepository.find({
            where: { imei: Not(In(imeis)) },
          })
        : [];

    if (orphanedDevices.length > 0) {
      await this.gpsDeviceRepository.remove(orphanedDevices);
    }

    const existingMap = new Map<string, GpsDevice>(existingDevices.map((e) => [e.imei, e]));

    const entitiesToSave: GpsDevice[] = [];

    for (const dto of dtos) {
      if (!dto.imei) continue;

      const existingEntity = existingMap.get(dto.imei);

      if (existingEntity === undefined) {
        const entity = mapCreateGpsDeviceDtoToEntity(dto);
        entity.createdAt = new Date(); // Set if not already
        // updatedAt will be set by TypeORM or manually

        if (dto.gpsTail && dto.gpsTail.length > 0) {
          // For new entities, map without id first; id will be set after save if needed
          entity.gpsTail = dto.gpsTail.map((tailDto) => mapGpsTailDtoToEntity(tailDto));
        }

        entitiesToSave.push(entity);
      } else {
        existingEntity.name = dto.name ?? existingEntity.name;
        existingEntity.lastLatitude = dto.lastLatitude ?? existingEntity.lastLatitude;
        existingEntity.lastLongitude = dto.lastLongitude ?? existingEntity.lastLongitude;
        existingEntity.speed = dto.speed ?? existingEntity.speed;
        existingEntity.totalDistance = dto.totalDistance ?? existingEntity.totalDistance;
        existingEntity.batteryLevel = dto.batteryLevel ?? existingEntity.batteryLevel;
        existingEntity.signalStrength = dto.signalStrength ?? existingEntity.signalStrength;
        existingEntity.engineStatus =
          dto.engineStatus !== undefined ? dto.engineStatus : existingEntity.engineStatus;
        existingEntity.lastUpdate = dto.lastUpdate ?? existingEntity.lastUpdate;

        if (dto.gpsTail && dto.gpsTail.length > 0) {
          const gpsTail = existingEntity.gpsTail ?? [];
          const existingTailsMap = new Map<number, GpsTail>(
            gpsTail.map((t) => [t.sequenceOrder, t]),
          );

          const newTailEntities: GpsTail[] = [];

          for (const tailDto of dto.gpsTail) {
            let tail = existingTailsMap.get(tailDto.sequenceOrder);

            if (tail) {
              tail.latitude = tailDto.latitude;
              tail.longitude = tailDto.longitude;
              tail.timestamp = tailDto.timestamp;
              // Add any other fields to update here

              existingTailsMap.delete(tailDto.sequenceOrder);
            } else {
              tail = mapGpsTailDtoToEntity(tailDto, existingEntity.id);
            }

            newTailEntities.push(tail);
          }

          // Delete extras if any (only when new tail is shorter)
          if (existingTailsMap.size > 0) {
            const extraIds = Array.from(existingTailsMap.values()).map((t) => t.id);
            await this.gpsDeviceRepository.manager
              .createQueryBuilder()
              .delete()
              .from('gps_tails')
              .where('id IN (:...ids)', { ids: extraIds })
              .execute();
          }

          // Assign the synced collection
          existingEntity.gpsTail = newTailEntities;
        }

        entitiesToSave.push(existingEntity);
      }
    }

    // Bulk save (handles both inserts and updates)
    return await this.gpsDeviceRepository.save(entitiesToSave);
  }

  async getDevicesfromGps() {
    if (!isGpsSyncEnabled()) {
      this.logger.warn('GPS sync is disabled (GPS_SYNC_ENABLED=false)');
      throw new HttpException('GPS sync is disabled', HttpStatus.SERVICE_UNAVAILABLE);
    }

    try {
      const url = `${this.apiBase}/get_devices?user_api_hash=${this.hash}`;
      const response$ = this.httpService.get(url, { timeout: 5000 });
      const response = await lastValueFrom(response$);
      return response.data;
    } catch (error: any) {
      // Log error
      if (error.code === 'ETIMEDOUT') {
        this.logger.error('Request timed out while fetching GPS devices');
      } else if (error.code === 'ECONNREFUSED') {
        this.logger.error('Connection refused to GPS API');
      } else {
        this.logger.error('Axios error fetching GPS devices', error.message);
      }

      // Throw to propagate to controller
      throw new HttpException(
        'Failed to fetch GPS devices from external API',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
