import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Axle } from './axle.entity';
import { UpdateAxleDTO } from './dtos/update-axle.dto';
import { AxleDTO } from './dtos/axle.dto';

@Injectable()
export class AxleService {
  constructor(
    @InjectRepository(Axle)
    private axleRepository: Repository<Axle>,
  ) {}

  async findById(id: number): Promise<AxleDTO | undefined> {
    const result = await this.axleRepository.findOne({ where: { id } });
    return result || undefined;
  }

  async findByFields(options: FindOneOptions<UpdateAxleDTO>): Promise<AxleDTO | undefined> {
    const result = await this.axleRepository.findOne(options);
    return result || undefined;
  }

  async find(options: FindManyOptions<UpdateAxleDTO>): Promise<Axle[] | undefined> {
    const result = await this.axleRepository.find(options);
    return result || undefined;
  }

  async findAndCount(options: FindManyOptions<AxleDTO>): Promise<[Axle[], number]> {
    return await this.axleRepository.findAndCount(options);
  }

  async save(axle: Axle, creator?: string): Promise<Axle> {
    const now = new Date();

    axle.createdAt = axle.createdAt ?? now;
    axle.updatedAt = now;

    if (creator) {
      axle.createdBy = axle.createdBy ?? creator;
      axle.updatedBy = creator;
    }

    return await this.axleRepository.save(axle);
  }
  async saveBulk(axles: Axle[], creator?: string): Promise<Axle[]> {
    const now = new Date();

    const preparedAxles = axles.map((axle) => {
      axle.createdAt = axle.createdAt ?? now;
      axle.updatedAt = now;

      if (creator) {
        axle.createdBy = axle.createdBy ?? creator;
        axle.updatedBy = creator;
      }

      return axle;
    });

    return await this.axleRepository.save(preparedAxles);
  }

  async update(axle: Axle, updater?: string): Promise<Axle> {
    const now = new Date();
    if (updater) axle.updatedBy = updater;
    axle.updatedAt = now;

    return await this.axleRepository.save(axle);
  }

  async updateBulk(axles: Axle[], updater?: string): Promise<Axle[]> {
    const now = new Date();

    const preparedAxles = axles.map((axle) => {
      axle.updatedAt = now;
      if (updater) axle.updatedBy = updater;
      return axle;
    });

    return await this.axleRepository.save(preparedAxles);
  }

  async delete(id: number): Promise<void> {
    await this.axleRepository.delete(id);
  }
}
