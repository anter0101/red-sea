import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { DeliveryPrice } from './delivery-price.entity';
import { DeliveryPriceQueryDTO } from './dtos/query-delivery-price.dto';

@Injectable()
export class DeliveryPriceService {
  constructor(
    @InjectRepository(DeliveryPrice)
    private readonly deliveryPriceRepository: Repository<DeliveryPrice>,
  ) {}

  async findById(id: number): Promise<DeliveryPrice | undefined> {
    const result = await this.deliveryPriceRepository.findOne({ where: { id } });
    return result || undefined;
  }

  async findByFields(options: FindOneOptions<DeliveryPrice>): Promise<DeliveryPrice | undefined> {
    const result = await this.deliveryPriceRepository.findOne(options);
    return result || undefined;
  }

  async find(options: FindManyOptions<DeliveryPrice>): Promise<DeliveryPrice[] | undefined> {
    const result = await this.deliveryPriceRepository.find(options);
    return result || undefined;
  }

  async findAndCount(
    query: DeliveryPriceQueryDTO,
    page: number,
    pageSize: number,
    sortField?: string,
    sortOrder: 'ASC' | 'DESC' = 'ASC',
  ): Promise<[DeliveryPrice[], number]> {
    const qb = this.deliveryPriceRepository
      .createQueryBuilder('price')
      .leftJoinAndSelect('price.client', 'client')
      .leftJoinAndSelect('price.area', 'area')
      .leftJoinAndSelect('price.priceType', 'priceType')
      .leftJoinAndSelect('area.government', 'government');

    if (query.clientId) {
      qb.andWhere('client.id = :clientId', { clientId: query.clientId });
    }
    if (query.areaId) {
      qb.andWhere('area.id = :areaId', { areaId: query.areaId });
    }
    if (query.priceTypeId) {
      qb.andWhere('priceType.id = :priceTypeId', { priceTypeId: query.priceTypeId });
    }

    if (sortField) {
      qb.orderBy(`price.${sortField}`, sortOrder);
    } else {
      qb.orderBy('price.id', 'DESC');
    }

    qb.skip(page * pageSize).take(pageSize);

    return await qb.getManyAndCount();
  }

  async save(price: DeliveryPrice, creator?: string): Promise<DeliveryPrice> {
    const now = new Date();

    price.createdAt = price.createdAt ?? now;
    price.updatedAt = now;

    if (creator) {
      price.createdBy = price.createdBy ?? creator;
      price.updatedBy = creator;
    }

    return await this.deliveryPriceRepository.save(price);
  }

  async saveMany(prices: DeliveryPrice[], creator?: string): Promise<DeliveryPrice[]> {
    const now = new Date();

    prices.forEach((price) => {
      price.createdAt = price.createdAt ?? now;
      price.updatedAt = now;

      if (creator) {
        price.createdBy = price.createdBy ?? creator;
        price.updatedBy = creator;
      }
    });

    return await this.deliveryPriceRepository.save(prices);
  }

  async update(price: DeliveryPrice, updater?: string): Promise<DeliveryPrice> {
    const now = new Date();

    price.updatedAt = now;
    if (updater) price.updatedBy = updater;

    return await this.deliveryPriceRepository.save(price);
  }

  async delete(id: number): Promise<void> {
    await this.deliveryPriceRepository.delete(id);
  }
}
