import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, FindManyOptions, FindOneOptions } from 'typeorm';
import { Salary } from './salary.entity';
import { SalaryDTO } from './dtos/salary.dto';
import { CreateSalaryDTO } from './dtos/create-salary.dto';
import { UpdateSalaryDTO } from './dtos/update-salary.dto';
import { SalaryQueryDTO } from './dtos/query-salary.dto';
import { applyQueryFilters } from 'src/core/utils/query-builder.util';
import { getStringColumns } from 'src/core/utils/entity-meta.util';
import { User } from '../user/user.entity';

@Injectable()
export class SalaryService {
  constructor(
    @InjectRepository(Salary)
    private salaryRepository: Repository<Salary>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findById(id: number): Promise<SalaryDTO | undefined> {
    const result = await this.salaryRepository.findOne({ where: { id } });
    return result || undefined;
  }

  async findByUserId(userId: number, manager?: EntityManager): Promise<Salary | undefined> {
    const salaryRepo = manager ? manager.getRepository(Salary) : this.salaryRepository;
    const result = await salaryRepo
      .createQueryBuilder('salary')
      .where('salary.user_id = :userId', { userId })
      .getOne();

    return result ?? undefined;
  }

  async findByFields(options: FindOneOptions<Salary>): Promise<Salary | undefined> {
    const result = await this.salaryRepository.findOne(options);
    return result || undefined;
  }

  async find(options: FindManyOptions<UpdateSalaryDTO>): Promise<Salary | undefined> {
    const result = await this.salaryRepository.findOne(options);
    return result || undefined;
  }

  async findAndCount(
    options: FindManyOptions<SalaryDTO>,
    query?: SalaryQueryDTO,
  ): Promise<[Salary[], number]> {
    if (!query) return await this.salaryRepository.findAndCount(options);

    const qb = this.salaryRepository
      .createQueryBuilder('salary')
      .leftJoinAndSelect('salary.user', 'user');

    applyQueryFilters(qb, query, {
      alias: 'salary',
      searchableFields: getStringColumns(Salary),
      enumFilters: ['salaryType'],
      dateFields: ['createdAt', 'updatedAt'],
      relations: [
        {
          alias: 'user',
          searchableFields: getStringColumns(User),
        },
      ],
    });

    return qb.getManyAndCount();
  }

  async save(
    input: CreateSalaryDTO,
    creator?: string,
    manager?: EntityManager,
  ): Promise<Salary> {
    const userRepo = manager ? manager.getRepository(User) : this.userRepository;
    const salaryRepo = manager ? manager.getRepository(Salary) : this.salaryRepository;

    const user = await userRepo.findOneBy({ id: input.userId });
    if (!user) {
      throw new NotFoundException(`User with id ${input.userId} not found`);
    }

    const entity = salaryRepo.create({
      salaryType: input.salaryType,
      salaryAmount: input.salaryAmount,
      dailyWorkPrice: input.dailyWorkPrice,
      commissionPerJourney: input.commissionPerJourney,
      commissionIsPercentage: input.commissionIsPercentage,
      nolonPercent: input.nolonPercent,
      user,
      createdBy: creator,
      updatedBy: creator,
      createdAt: new Date(),
    });

    return salaryRepo.save(entity);
  }

  async update(
    salaryDTO: UpdateSalaryDTO,
    updater?: string,
    manager?: EntityManager,
  ): Promise<UpdateSalaryDTO> {
    const salaryRepo = manager ? manager.getRepository(Salary) : this.salaryRepository;
    const entity = salaryRepo.create({
      ...salaryDTO,
      updatedBy: updater,
      updatedAt: new Date(),
    });
    await salaryRepo.update({ id: salaryDTO.id }, entity);
    return salaryDTO;
  }

  async delete(id: number): Promise<void> {
    await this.salaryRepository.delete(id);
  }
}
