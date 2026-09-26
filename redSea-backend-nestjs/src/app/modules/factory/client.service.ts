import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from './client.entity';
import { Repository, FindManyOptions, FindOneOptions, IsNull } from 'typeorm';
import { ClientQueryDTO } from './dtos/query-client.dto';
import { applyQueryFilters } from 'src/core/utils/query-builder.util';
import { getStringColumns } from 'src/core/utils/entity-meta.util';
import { generateUniqueCode } from 'src/core/utils/generator';
import { GeneratorTypes } from 'src/core/enums/generator-types';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  // -------------------------------------------------------
  // FIND BY ID
  // -------------------------------------------------------
  async findById(id: number): Promise<Client | undefined> {
    const result = await this.clientRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    return result || undefined;
  }

  // -------------------------------------------------------
  // GENERIC FIND ONE
  // -------------------------------------------------------
  async findByFields(options: FindOneOptions<Client>): Promise<Client | undefined> {
    const where = options.where as Record<string, unknown> | Record<string, unknown>[] | undefined;
    const result = await this.clientRepository.findOne({
      ...options,
      where: Array.isArray(where)
        ? where.map((w) => ({ ...w, deletedAt: IsNull() }))
        : ({ ...(where ?? {}), deletedAt: IsNull() } as any),
    });
    return result || undefined;
  }

  // -------------------------------------------------------
  // GENERIC FIND MANY
  // -------------------------------------------------------
  async find(options: FindManyOptions<Client>): Promise<Client[] | undefined> {
    const where = options.where as Record<string, unknown> | Record<string, unknown>[] | undefined;
    const result = await this.clientRepository.find({
      ...options,
      where: Array.isArray(where)
        ? where.map((w) => ({ ...w, deletedAt: IsNull() }))
        : ({ ...(where ?? {}), deletedAt: IsNull() } as any),
    });
    return result || undefined;
  }

  // -------------------------------------------------------
  // PAGINATED FIND + COUNT
  // -------------------------------------------------------
  async findAndCount(
    options: FindManyOptions<Client>,
    query?: ClientQueryDTO,
  ): Promise<[Client[], number]> {
    if (!query) {
      return this.clientRepository.findAndCount({
        ...options,
        where: {
          ...((options.where as object) ?? {}),
          deletedAt: IsNull(),
        } as any,
      });
    }

    const qb = this.clientRepository
      .createQueryBuilder('client')
      .andWhere('client.deleted_at IS NULL');

    applyQueryFilters(qb, query, {
      alias: 'client',
      searchableFields: getStringColumns(Client),
      enumFilters: [],
      dateFields: ['createdAt', 'updatedAt'],
    });

    return qb.getManyAndCount();
  }

  // -------------------------------------------------------
  // CREATE
  // -------------------------------------------------------
  async save(client: Client, creator?: string): Promise<Client> {
    const now = new Date();

    client.companyCode = await generateUniqueCode(
      this.clientRepository,
      GeneratorTypes.CLIENT,
      'companyCode',
    );

    client.createdAt = client.createdAt ?? now;
    client.updatedAt = now;

    if (creator) {
      client.createdBy = client.createdBy ?? creator;
      client.updatedBy = creator;
    }

    return await this.clientRepository.save(client);
  }

  // -------------------------------------------------------
  // UPDATE
  // -------------------------------------------------------
  async update(client: Client, updater?: string): Promise<Client> {
    const now = new Date();

    client.updatedAt = now;
    if (updater) client.updatedBy = updater;

    return await this.clientRepository.save(client);
  }

  // -------------------------------------------------------
  // SOFT DELETE
  // -------------------------------------------------------
  async softDelete(id: number, deletedBy?: string): Promise<void> {
    const existing = await this.clientRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!existing) {
      throw new NotFoundException(`Client with id ${id} not found`);
    }

    existing.deletedAt = new Date();
    existing.deletedBy = deletedBy;
    existing.updatedAt = new Date();
    if (deletedBy) existing.updatedBy = deletedBy;

    await this.clientRepository.save(existing);
  }
}
