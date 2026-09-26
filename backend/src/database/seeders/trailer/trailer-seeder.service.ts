import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trailer } from 'src/app/modules/trailer/trailer.entity';
import { generateUniqueCode } from 'src/core/utils/generator';
import { GeneratorTypes } from 'src/core/enums/generator-types';
import { trailers } from './data';

@Injectable()
export class TrailerSeederService {
  constructor(
    @InjectRepository(Trailer)
    private readonly trailerRepository: Repository<Trailer>,
  ) {}

  async create(): Promise<(Trailer | null)[]> {
    const results: (Trailer | null)[] = [];
    const now = new Date();

    for (const data of trailers) {
      const existing = await this.trailerRepository.findOne({
        where: { chassisNumber: data.chassisNumber },
      });

      if (existing) {
        results.push(null);
        continue;
      }

      const code = await generateUniqueCode(this.trailerRepository, GeneratorTypes.TRAILER);

      const entity = this.trailerRepository.create({
        code,
        chaseType: data.chaseType,
        manufacturer: data.manufacturer,
        status: data.status,
        manufactureYear: data.manufactureYear,
        color: data.color,
        maxWeight: data.maxWeight,
        plateNumber: data.plateNumber,
        plateLetters: data.plateLetters,
        chassisNumber: data.chassisNumber,
        licenseNumber: data.licenseNumber,
        licenseExpiryDate: new Date(data.licenseExpiryDate),
        axleCount: data.axleCount,
        ownerShip: data.ownerShip,
        notes: data.notes,
        createdAt: now,
        updatedAt: now,
        createdBy: 'system',
        updatedBy: 'system',
      });

      const saved = await this.trailerRepository.save(entity);
      results.push(saved);
    }

    return results;
  }
}
