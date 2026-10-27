import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Driver } from './driver.entity';
import { FindManyOptions, FindOneOptions, IsNull, Repository } from 'typeorm';
import { DriverDTO } from './dtos/driver.dto';
import { UpdateDriverDTO } from './dtos/update-driver.dto';
import { generateUniqueCode, generateUniqueUsername } from 'src/core/utils/generator';
import { User } from '../user/user.entity';
import { UserRole } from 'src/core/enums/user-role';
import { UserStatus } from 'src/core/enums/user-status';
import { DriverQueryDTO } from './dtos/query-driver.dto';
import { applyQueryFilters } from 'src/core/utils/query-builder.util';
import { getStringColumns } from 'src/core/utils/entity-meta.util';
import { Journey } from '../journey/journey.entity';
import { JourneyStatus } from 'src/core/enums/journey';
import { DriverStatsDTO } from './dtos/driver-stats.dto';

export type DriverWithCurrentJourney = Driver & {
  currentJourneyId?: number;
  currentCarId?: number;
  currentCarCode?: string;
};

@Injectable()
export class DriverService {
  constructor(
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Journey)
    private journeyRepository: Repository<Journey>,
  ) {}

  async findById(id: number): Promise<DriverDTO | undefined> {
    const result = await this.driverRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    return result || undefined;
  }

  async findByFields(options: FindOneOptions<UpdateDriverDTO>): Promise<DriverDTO | undefined> {
    const where = options.where;
    const result = await this.driverRepository.findOne({
      ...(options as FindOneOptions<Driver>),
      where: Array.isArray(where)
        ? where.map((w) => ({ ...w, deletedAt: IsNull() }))
        : { ...(where ?? {}), deletedAt: IsNull() },
    });
    return result || undefined;
  }

  async find(options: FindManyOptions<UpdateDriverDTO>): Promise<Driver | undefined> {
    const where = options.where;
    const result = await this.driverRepository.findOne({
      ...(options as FindOneOptions<Driver>),
      where: Array.isArray(where)
        ? where.map((w) => ({ ...w, deletedAt: IsNull() }))
        : { ...(where ?? {}), deletedAt: IsNull() },
    });
    return result || undefined;
  }

  async findAndCount(
    options: FindManyOptions<DriverDTO>,
    query?: DriverQueryDTO,
  ): Promise<[DriverWithCurrentJourney[], number]> {
    if (!query) {
      const [results, count] = await this.driverRepository.findAndCount({
        ...(options as FindManyOptions<Driver>),
        where: {
          ...(options.where ?? {}),
          deletedAt: IsNull(),
        },
      });
      return [await this.enrichWithCurrentJourneys(results), count];
    }

    const qb = this.driverRepository
      .createQueryBuilder('driver')
      .leftJoinAndSelect('driver.user', 'user')
      .leftJoinAndSelect('user.contacts', 'contacts')
      .leftJoinAndSelect('user.salary', 'salary')
      .andWhere('driver.deleted_at IS NULL');

    applyQueryFilters(qb, query, {
      alias: 'driver',
      searchableFields: getStringColumns(Driver),
      enumFilters: [],
      dateFields: ['createdAt', 'updatedAt'],
      relations: [
        {
          alias: 'user',
          searchableFields: getStringColumns(User),
        },
      ],
    });

    const [results, count] = await qb.getManyAndCount();
    return [await this.enrichWithCurrentJourneys(results), count];
  }

  async getStats(): Promise<DriverStatsDTO> {
    const row = await this.driverRepository
      .createQueryBuilder('driver')
      .leftJoin('driver.user', 'user')
      .where('driver.deleted_at IS NULL')
      .select('COUNT(DISTINCT driver.id)', 'total')
      .addSelect(
        `COUNT(DISTINCT driver.id) FILTER (WHERE user.status = '${UserStatus.ONROAD}')`,
        'onRoad',
      )
      .addSelect(
        `COUNT(DISTINCT driver.id) FILTER (WHERE user.status = '${UserStatus.AVAILABLE}')`,
        'available',
      )
      .getRawOne<{ total: string; onRoad: string; available: string }>();

    return {
      total: Number(row?.total ?? 0),
      onRoad: Number(row?.onRoad ?? 0),
      available: Number(row?.available ?? 0),
    };
  }

  async enrichWithCurrentJourneys(drivers: Driver[]): Promise<DriverWithCurrentJourney[]> {
    if (drivers.length === 0) return [];

    const driverIds = drivers.map((d) => d.id);
    const rows = await this.journeyRepository
      .createQueryBuilder('journey')
      .leftJoin('journey.car', 'car')
      .select('journey.id', 'id')
      .addSelect('journey.driver_id', 'driverId')
      .addSelect('car.id', 'carId')
      .addSelect('car.code', 'carCode')
      .where('journey.driver_id IN (:...driverIds)', { driverIds })
      .andWhere('journey.tripStatus != :invoiceIssued', {
        invoiceIssued: JourneyStatus.INVOICE_ISSUED,
      })
      .orderBy('journey.id', 'DESC')
      .getRawMany<{ id: string; driverId: string; carId: string | null; carCode: string | null }>();

    const currentByDriver = new Map<
      number,
      { currentJourneyId: number; currentCarId?: number; currentCarCode?: string }
    >();
    for (const row of rows) {
      const driverId = Number(row.driverId);
      if (currentByDriver.has(driverId)) continue;
      currentByDriver.set(driverId, {
        currentJourneyId: Number(row.id),
        currentCarId: row.carId != null ? Number(row.carId) : undefined,
        currentCarCode: row.carCode ?? undefined,
      });
    }

    return drivers.map((driver) => {
      const current = currentByDriver.get(driver.id);
      return Object.assign(driver, {
        currentJourneyId: current?.currentJourneyId,
        currentCarId: current?.currentCarId,
        currentCarCode: current?.currentCarCode,
      });
    });
  }

  async save(driver: Driver, creator?: string): Promise<Driver> {
    // Auto-generate user code if not already assigned
    if (driver.user && !driver.user.code) {
      driver.user.code = await generateUniqueCode(this.userRepository, driver.user.role);
    }

    if (driver.user && driver.user.role === UserRole.DRIVER) {
      driver.user.username = await generateUniqueUsername(this.userRepository, UserRole.DRIVER);
    }

    if (driver.user && driver.user.role === UserRole.DRIVER_ASSISTANT) {
      driver.user.username = await generateUniqueUsername(
        this.userRepository,
        UserRole.DRIVER_ASSISTANT,
      );
    }

    // Automatically handle metadata fields
    const now = new Date();
    driver.createdAt = driver.createdAt ?? now;
    driver.updatedAt = now;

    if (creator) {
      driver.createdBy = driver.createdBy ?? creator;
      driver.updatedBy = creator;

      if (driver.user) {
        driver.user.createdBy = driver.user.createdBy ?? creator;
        driver.user.updatedBy = creator;
        driver.user.createdAt = driver.createdAt;
      }
    }

    // Save both driver and nested user
    const savedDriver = await this.driverRepository.save(driver);
    return savedDriver;
  }

  async update(driver: Driver, updater?: string): Promise<Driver> {
    const now = new Date();

    // Handle updater metadata
    if (updater) {
      driver.updatedBy = updater;
      if (driver.user) driver.user.updatedBy = updater;
    }

    driver.updatedAt = now;
    if (driver.user) driver.user.updatedAt = now;

    const updatedDriver = await this.driverRepository.save(driver);
    return updatedDriver;
  }

  async softDelete(id: number, deletedBy?: string): Promise<void> {
    const existing = await this.driverRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!existing) {
      throw new NotFoundException(`Driver with id ${id} not found`);
    }

    existing.deletedAt = new Date();
    existing.deletedBy = deletedBy;
    existing.updatedAt = new Date();
    if (deletedBy) existing.updatedBy = deletedBy;

    await this.driverRepository.save(existing);
  }
}
