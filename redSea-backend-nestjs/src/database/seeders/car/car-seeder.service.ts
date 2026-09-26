import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Car } from 'src/app/modules/car/car.entity';
import { generateUniqueCode } from 'src/core/utils/generator';
import { GeneratorTypes } from 'src/core/enums/generator-types';
import { cars } from './data';

@Injectable()
export class CarSeederService {
  constructor(
    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,
  ) {}

  async create(): Promise<(Car | null)[]> {
    const results: (Car | null)[] = [];
    const now = new Date();

    for (const data of cars) {
      const existing = await this.carRepository.findOne({
        where: { chassisNumber: data.chassisNumber },
      });

      if (existing) {
        results.push(null);
        continue;
      }

      const code = await generateUniqueCode(this.carRepository, GeneratorTypes.CAR);

      const entity = this.carRepository.create({
        code,
        manufacturer: data.manufacturer,
        model: data.model,
        status: data.status,
        manufactureYear: data.manufactureYear,
        color: data.color,
        cylinders: data.cylinders,
        horsepower: data.horsepower,
        axleCount: data.axleCount,
        maxWeight: data.maxWeight,
        plateNumber: data.plateNumber,
        plateLetters: data.plateLetters,
        chassisNumber: data.chassisNumber,
        licenseNumber: data.licenseNumber,
        licenseExpiryDate: new Date(data.licenseExpiryDate),
        ownerShip: data.ownerShip,
        notes: data.notes,
        createdAt: now,
        updatedAt: now,
        createdBy: 'system',
        updatedBy: 'system',
      });

      const saved = await this.carRepository.save(entity);
      results.push(saved);
    }

    return results;
  }
}
