// src/branch/branch.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, FindOneOptions } from 'typeorm';

import { Branch } from './branch.entity';
import { BranchQueryDTO } from './dtos/query-branch.dto';
import { applyQueryFilters } from 'src/core/utils/query-builder.util';
import { getStringColumns } from 'src/core/utils/entity-meta.util';

@Injectable()
export class BranchService {
  constructor(
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
  ) {}

  async findById(id: number): Promise<Branch | undefined> {
    const result = await this.branchRepository.findOne({ where: { id } });
    return result ?? undefined;
  }

  async findByFields(options: FindOneOptions<Branch>): Promise<Branch | undefined> {
    const result = await this.branchRepository.findOne(options);
    return result ?? undefined;
  }

  async find(options: FindManyOptions<Branch>): Promise<Branch[]> {
    const result = await this.branchRepository.find(options);
    return result;
  }

  async findAndCount(
    options: FindManyOptions<Branch>,
    query?: BranchQueryDTO,
  ): Promise<[Branch[], number]> {
    if (!query) {
      return this.branchRepository.findAndCount(options);
    }

    const qb = this.branchRepository.createQueryBuilder('branch');

    applyQueryFilters(qb, query, {
      alias: 'branch',
      searchableFields: getStringColumns(Branch),
      enumFilters: [],
      dateFields: ['createdAt', 'updatedAt'],
    });

    return qb.getManyAndCount();
  }

  async save(branch: Branch, creator?: string): Promise<Branch> {
    const now = new Date();

    branch.createdAt = branch.createdAt ?? now;
    branch.updatedAt = now;

    if (creator) {
      branch.createdBy = branch.createdBy ?? creator;
      branch.updatedBy = creator;
    }

    const savedBranch = await this.branchRepository.save(branch);
    return savedBranch;
  }

  async update(branch: Branch, updater?: string): Promise<Branch> {
    const now = new Date();

    branch.updatedAt = now;
    if (updater) branch.updatedBy = updater;

    const updatedBranch = await this.branchRepository.save(branch);
    return updatedBranch;
  }

  async delete(id: number): Promise<void> {
    await this.branchRepository.delete(id);
  }
}
