import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PriceType } from 'src/app/modules/price-type/price-type.entity';
import { PackingType } from 'src/core/enums/packing-type';

@Injectable()
export class PriceTypeSeederService {
  constructor(
    @InjectRepository(PriceType)
    private readonly priceTypeRepository: Repository<PriceType>,
  ) {}

  async create(): Promise<(PriceType | null)[]> {
    const packingTypes = Object.values(PackingType);

    const results: (PriceType | null)[] = [];
    for (const packingType of packingTypes) {
      const existing = await this.priceTypeRepository.findOne({ where: { name: packingType } });
      if (existing) {
        results.push(null);
        continue;
      }

      const descriptionMap: Record<PackingType, string> = {
        [PackingType.BAGGED]: 'تسعير للمنتجات المعبأة في شكاير',
        [PackingType.JUMBO_BAG]: 'تسعير للمنتجات المعبأة في جامبو باج',
        [PackingType.SILO10]: 'تسعير شحن صوامع 10 طن',
        [PackingType.SILO12]: 'تسعير شحن صوامع 12 طن',
        [PackingType.LOOSE]: 'تسعير للمنتجات السائبة',
      };

      const priceType = this.priceTypeRepository.create({
        name: packingType,
        description: descriptionMap[packingType as PackingType],
      });
      const saved = await this.priceTypeRepository.save(priceType);
      results.push(saved);
    }

    return results;
  }
}
