import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Tire } from './tire.entity';
import { UpdateTireDTO } from './dtos/update-tire.dto';
import { TireDTO } from './dtos/tire.dto';

@Injectable()
export class TireService {
  constructor(
    @InjectRepository(Tire)
    private tireRepository: Repository<Tire>,
  ) {}

  async findById(id: number): Promise<TireDTO | undefined> {
    const result = await this.tireRepository.findOne({ where: { id } });
    return result || undefined;
  }

  async findByFields(options: FindOneOptions<UpdateTireDTO>): Promise<TireDTO | undefined> {
    const result = await this.tireRepository.findOne(options);
    return result || undefined;
  }

  async find(options: FindManyOptions<UpdateTireDTO>): Promise<Tire[] | undefined> {
    const result = await this.tireRepository.find(options);
    return result || undefined;
  }

  async findAndCount(options: FindManyOptions<TireDTO>): Promise<[Tire[], number]> {
    return await this.tireRepository.findAndCount(options);
  }

  async save(tire: Tire, creator?: string): Promise<Tire> {
    const now = new Date();

    tire.createdAt = tire.createdAt ?? now;
    tire.updatedAt = now;

    if (creator) {
      tire.createdBy = tire.createdBy ?? creator;
      tire.updatedBy = creator;
    }

    return await this.tireRepository.save(tire);
  }

  async update(tire: Tire, updater?: string): Promise<Tire> {
    const now = new Date();
    if (updater) tire.updatedBy = updater;
    tire.updatedAt = now;

    return await this.tireRepository.save(tire);
  }

  async delete(id: number): Promise<void> {
    await this.tireRepository.delete(id);
  }
}
