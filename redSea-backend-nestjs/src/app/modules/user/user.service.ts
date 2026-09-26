import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { FindManyOptions, FindOneOptions, IsNull, Repository } from 'typeorm';
import { UpdateUserDTO } from './dtos/update-user.dto';
import { UserDTO } from './dtos/user.dto';
import { transformPassword } from 'src/core/security';
import { generateUniqueCode, generateUniqueUsername } from 'src/core/utils/generator';
import { UserQueryDTO } from './dtos/user-query.dto';
import { applyQueryFilters } from 'src/core/utils/query-builder.util';
import { getStringColumns } from 'src/core/utils/entity-meta.util';
import { UserStatus } from 'src/core/enums/user-status';
import { UserRole } from 'src/core/enums/user-role';
import { UserStatsDTO } from './dtos/user-stats.dto';
import { Journey } from '../journey/journey.entity';
import { JourneyStatus } from 'src/core/enums/journey';

export type UserWithCurrentJourney = User & {
  currentJourneyId?: number;
  currentCarId?: number;
  currentCarCode?: string;
};

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Journey)
    private journeyRepository: Repository<Journey>,
  ) {}

  async findById(id: number): Promise<UserDTO | undefined> {
    const result = await this.userRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    return result || undefined;
  }

  async findByFields(options: FindOneOptions<UpdateUserDTO>): Promise<UserDTO | undefined> {
    const where = options.where as Record<string, unknown> | Record<string, unknown>[] | undefined;
    const result = await this.userRepository.findOne({
      ...(options as FindOneOptions<User>),
      where: Array.isArray(where)
        ? where.map((w) => ({ ...w, deletedAt: IsNull() }))
        : ({ ...(where ?? {}), deletedAt: IsNull() } as any),
    });
    return result || undefined;
  }

  async find(options: FindManyOptions<UpdateUserDTO>): Promise<User | undefined> {
    const where = options.where as Record<string, unknown> | Record<string, unknown>[] | undefined;
    const result = await this.userRepository.findOne({
      ...(options as FindOneOptions<User>),
      where: Array.isArray(where)
        ? where.map((w) => ({ ...w, deletedAt: IsNull() }))
        : ({ ...(where ?? {}), deletedAt: IsNull() } as any),
    });
    return result || undefined;
  }

  async findAndCount(
    options: FindManyOptions<UserDTO>,
    query?: UserQueryDTO,
  ): Promise<[UserWithCurrentJourney[], number]> {
    if (!query) {
      const [results, count] = await this.userRepository.findAndCount({
        ...(options as FindManyOptions<User>),
        where: {
          ...((options.where as object) ?? {}),
          deletedAt: IsNull(),
        } as any,
      });
      return [await this.enrichAssistantsWithCurrentJourneys(results), count];
    }

    const qb = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.contacts', 'contacts')
      .leftJoinAndSelect('user.salary', 'salary')
      .andWhere('user.deleted_at IS NULL');

    applyQueryFilters(qb, query, {
      alias: 'user',
      searchableFields: getStringColumns(User),
      enumFilters: ['role', 'status'],
      dateFields: ['createdAt', 'updatedAt'],
    });

    const [results, count] = await qb.getManyAndCount();
    return [await this.enrichAssistantsWithCurrentJourneys(results, query.role), count];
  }

  async getStats(role?: UserRole): Promise<UserStatsDTO> {
    const qb = this.userRepository
      .createQueryBuilder('user')
      .where('user.deleted_at IS NULL')
      .select('COUNT(DISTINCT user.id)', 'total')
      .addSelect(
        `COUNT(DISTINCT user.id) FILTER (WHERE user.status = '${UserStatus.ONROAD}')`,
        'onRoad',
      )
      .addSelect(
        `COUNT(DISTINCT user.id) FILTER (WHERE user.status = '${UserStatus.AVAILABLE}')`,
        'available',
      );

    if (role) {
      qb.andWhere('user.role = :role', { role });
    }

    const row = await qb.getRawOne<{ total: string; onRoad: string; available: string }>();

    return {
      total: Number(row?.total ?? 0),
      onRoad: Number(row?.onRoad ?? 0),
      available: Number(row?.available ?? 0),
    };
  }

  async enrichAssistantsWithCurrentJourneys(
    users: User[],
    role?: UserRole,
  ): Promise<UserWithCurrentJourney[]> {
    const shouldEnrich =
      role === UserRole.DRIVER_ASSISTANT ||
      users.some((u) => u.role === UserRole.DRIVER_ASSISTANT);

    if (!shouldEnrich || users.length === 0) {
      return users;
    }

    const assistantIds = users
      .filter((u) => u.role === UserRole.DRIVER_ASSISTANT)
      .map((u) => u.id);

    if (assistantIds.length === 0) {
      return users;
    }

    const rows = await this.journeyRepository
      .createQueryBuilder('journey')
      .leftJoin('journey.car', 'car')
      .select('journey.id', 'id')
      .addSelect('journey.assistant_id', 'assistantId')
      .addSelect('car.id', 'carId')
      .addSelect('car.code', 'carCode')
      .where('journey.assistant_id IN (:...assistantIds)', { assistantIds })
      .andWhere('journey.tripStatus != :invoiceIssued', {
        invoiceIssued: JourneyStatus.INVOICE_ISSUED,
      })
      .orderBy('journey.id', 'DESC')
      .getRawMany<{ id: string; assistantId: string; carId: string | null; carCode: string | null }>();

    const currentByAssistant = new Map<
      number,
      { currentJourneyId: number; currentCarId?: number; currentCarCode?: string }
    >();
    for (const row of rows) {
      const assistantId = Number(row.assistantId);
      if (currentByAssistant.has(assistantId)) continue;
      currentByAssistant.set(assistantId, {
        currentJourneyId: Number(row.id),
        currentCarId: row.carId != null ? Number(row.carId) : undefined,
        currentCarCode: row.carCode ?? undefined,
      });
    }

    return users.map((user) => {
      const current = currentByAssistant.get(user.id);
      if (!current) return user;
      return Object.assign(user, {
        currentJourneyId: current.currentJourneyId,
        currentCarId: current.currentCarId,
        currentCarCode: current.currentCarCode,
      });
    });
  }

  async save(userDTO: UserDTO, creator?: string): Promise<User> {
    // Generate a unique code for the user
    const userCode = await generateUniqueCode(this.userRepository, userDTO.role);
    userDTO.code = userCode;

    userDTO.username = await generateUniqueUsername(this.userRepository, userDTO.role, 'username');

    // Apply creator fields
    if (creator) {
      userDTO.createdBy ??= creator;
      userDTO.updatedBy = creator;
    }

    // Ensure creation timestamp is set
    userDTO.createdAt ??= new Date();

    // Create an entity instance (so TypeORM lifecycle hooks and defaults apply)
    const entity = this.userRepository.create(userDTO);

    // Persist the entity
    return await this.userRepository.save(entity);
  }

  async update(userDTO: UpdateUserDTO, updater?: string): Promise<UpdateUserDTO> {
    if (updater) {
      userDTO.updatedBy = updater;
      userDTO.updatedAt = new Date();
    }

    // Handle password hashing if present
    if (userDTO.password) {
      await transformPassword(userDTO);
    }

    // Strip relation fields that cannot be updated via a simple UPDATE
    // (e.g. contacts, attachments, salary). These are managed separately.
    const {
      contacts: _contacts,
      userAttachments: _userAttachments,
      salary: _salary,
      ...scalarFields
    } = userDTO as any;
    void _contacts;
    void _userAttachments;
    void _salary;

    // Perform partial update (exclude immutable fields like createdAt)
    await this.userRepository.update(
      { id: userDTO.id },
      {
        ...scalarFields,
        updatedAt: userDTO.updatedAt,
        updatedBy: userDTO.updatedBy,
      },
    );

    return userDTO;
  }

  async softDelete(id: number, deletedBy?: string): Promise<void> {
    const existing = await this.userRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!existing) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    existing.deletedAt = new Date();
    existing.deletedBy = deletedBy;
    existing.updatedAt = new Date();
    if (deletedBy) existing.updatedBy = deletedBy;

    await this.userRepository.save(existing);
  }
}
