import { BaseDTO } from 'src/core/utils/base.dto';
import { DeliveryPrice } from './delivery-price.entity';
import { DeliveryPriceDTO } from './dtos/delivery-price.dto';
import { CreateDeliveryPriceDTO } from './dtos/create-delivery-price.dto';
import { UpdateDeliveryPriceDTO } from './dtos/update-delivery-price.dto';
import { Client } from '../factory/client.entity';
import { Area } from '../area/area.entity';
import { PriceType } from '../price-type/price-type.entity';
import {
  AreaDeliveryPricesDTO,
  GovernmentDeliveryPricesDTO,
} from './dtos/grouped-delivery-price.dto';

const allowedDeliveryPriceDtoKeys: ReadonlyArray<keyof DeliveryPriceDTO | keyof BaseDTO> = [
  'id',
  'client',
  'area',
  'priceType',
  'basePrice',
  'additionalFees',
  'taxPrice',
  'totalPrice',
  'nolonPrice',
  'employeeNolonAmount',
  'validFrom',
  'validTo',
  'notes',
  'createdBy',
  'updatedBy',
  'createdAt',
  'updatedAt',
] as const;

export function mapDeliveryPriceToDeliveryPriceDtoSelective(
  price: DeliveryPrice,
  keys?: (keyof DeliveryPriceDTO | keyof BaseDTO)[],
): Partial<DeliveryPriceDTO>;

export function mapDeliveryPriceToDeliveryPriceDtoSelective(
  prices: DeliveryPrice[],
  keys?: (keyof DeliveryPriceDTO | keyof BaseDTO)[],
): Partial<DeliveryPriceDTO>[];

export function mapDeliveryPriceToDeliveryPriceDtoSelective(
  data: DeliveryPrice | DeliveryPrice[],
  keys?: (keyof DeliveryPriceDTO | keyof BaseDTO)[],
): Partial<DeliveryPriceDTO> | Partial<DeliveryPriceDTO>[] {
  const mapSingle = (price: DeliveryPrice): Partial<DeliveryPriceDTO> => {
    const dto: Partial<DeliveryPriceDTO> = {};

    const keysToMap = (keys || allowedDeliveryPriceDtoKeys).filter((key) =>
      (allowedDeliveryPriceDtoKeys as readonly string[]).includes(key),
    );

    keysToMap.forEach((key) => {
      if (key in price && (price as any)[key] !== undefined) {
        (dto as any)[key] = (price as any)[key];
      }
    });

    // Only add client if it's in the requested keys
    if (keysToMap.includes('client') && price.client) {
      (dto as any).client = {
        id: price.client.id,
        name: price.client.name,
      };
    }

    // Only add area if it's in the requested keys
    if (keysToMap.includes('area') && price.area) {
      (dto as any).area = {
        id: price.area.id,
        name: price.area.name,
      };
    }

    // Only add priceType if it's in the requested keys
    if (keysToMap.includes('priceType') && price.priceType) {
      (dto as any).priceType = {
        id: price.priceType.id,
        name: price.priceType.name,
        description: price.priceType.description,
      };
    }

    return dto;
  };

  return Array.isArray(data) ? data.map(mapSingle) : mapSingle(data);
}

export function mapDeliveryPriceToDTO(price: DeliveryPrice): DeliveryPriceDTO {
  return mapDeliveryPriceToDeliveryPriceDtoSelective(price, [
    'id',
    'client',
    'area',
    'priceType',
    'basePrice',
    'additionalFees',
    'taxPrice',
    'totalPrice',
    'nolonPrice',
    'employeeNolonAmount',
    'validFrom',
    'validTo',
    'notes',
    'createdBy',
    'updatedBy',
    'createdAt',
    'updatedAt',
  ]) as DeliveryPriceDTO;
}

export const mapCreateDeliveryPriceDtoToEntity = (dto: CreateDeliveryPriceDTO): DeliveryPrice => {
  const entity = new DeliveryPrice();

  if (dto.clientId !== undefined) {
    entity.client = { id: dto.clientId } as Client;
  }

  if (dto.areaId !== undefined) {
    entity.area = { id: dto.areaId } as Area;
  }

  if (dto.priceTypeId !== undefined) {
    entity.priceType = { id: dto.priceTypeId } as PriceType;
  }

  entity.basePrice = dto.basePrice;
  entity.additionalFees = dto.additionalFees ?? 0;

  (entity as any).taxPrice = dto.taxPrice ?? 0;
  entity.nolonPrice = dto.nolonPrice ?? 0;
  entity.employeeNolonAmount = dto.employeeNolonAmount ?? 0;

  const base = Number(entity.basePrice ?? 0);
  const additional = Number(entity.additionalFees ?? 0);
  const tax = Number((entity as any).taxPrice ?? 0);
  entity.totalPrice = base + additional + tax;

  entity.validFrom = dto.validFrom;
  entity.validTo = dto.validTo;
  entity.notes = dto.notes;

  if (dto.createdAt !== undefined) entity.createdAt = dto.createdAt;

  return entity;
};

export const mapUpdateDeliveryPriceDtoToEntity = (
  dto: UpdateDeliveryPriceDTO,
  existing: DeliveryPrice,
): DeliveryPrice => {
  const entity = new DeliveryPrice();

  entity.id = existing.id;
  entity.createdAt = existing.createdAt;

  entity.client = dto.clientId !== undefined ? ({ id: dto.clientId } as Client) : existing.client;

  entity.area = dto.areaId !== undefined ? ({ id: dto.areaId } as Area) : existing.area;

  entity.priceType =
    dto.priceTypeId !== undefined ? ({ id: dto.priceTypeId } as PriceType) : existing.priceType;

  entity.basePrice = dto.basePrice ?? existing.basePrice;
  entity.additionalFees = dto.additionalFees ?? existing.additionalFees;

  (entity as any).taxPrice =
    dto.taxPrice !== undefined ? dto.taxPrice : ((existing as any).taxPrice ?? 0);

  entity.nolonPrice = dto.nolonPrice !== undefined ? dto.nolonPrice : (existing.nolonPrice ?? 0);
  entity.employeeNolonAmount =
    dto.employeeNolonAmount !== undefined
      ? dto.employeeNolonAmount
      : (existing.employeeNolonAmount ?? 0);

  const base = Number(entity.basePrice ?? 0);
  const additional = Number(entity.additionalFees ?? 0);
  const tax = Number((entity as any).taxPrice ?? 0);
  entity.totalPrice = base + additional + tax;

  entity.validFrom = (dto.validFrom as any) ?? existing.validFrom;
  entity.validTo = (dto.validTo as any) ?? existing.validTo;
  entity.notes = dto.notes ?? existing.notes;

  return entity;
};

export function mapDeliveryPricesGrouped(prices: DeliveryPrice[]): GovernmentDeliveryPricesDTO[] {
  const grouped: GovernmentDeliveryPricesDTO[] = [];

  prices.forEach((price) => {
    if (!price.area || !price.area.government) {
      return;
    }

    const govId = price.area.government.id;
    const govName = price.area.government.name;

    let gov = grouped.find((g) => g.id === govId);
    if (!gov) {
      gov = new GovernmentDeliveryPricesDTO();
      gov.id = govId;
      gov.name = govName;
      gov.areas = [];
      grouped.push(gov);
    }

    const areaId = price.area.id;
    const areaName = price.area.name;

    let area = gov.areas.find((a) => a.id === areaId);
    if (!area) {
      area = new AreaDeliveryPricesDTO();
      area.id = areaId;
      area.name = areaName;
      area.deliveryPrices = [];
      gov.areas.push(area);
    }

    // Map delivery price without client and area fields to avoid circular references
    const priceDto = mapDeliveryPriceToDeliveryPriceDtoSelective(price, [
      'id',
      'priceType',
      'basePrice',
      'additionalFees',
      'taxPrice',
      'totalPrice',
      'nolonPrice',
      'employeeNolonAmount',
      'validFrom',
      'validTo',
      'notes',
      'createdBy',
      'updatedBy',
      'createdAt',
      'updatedAt',
    ]) as DeliveryPriceDTO;

    area.deliveryPrices.push(priceDto);
  });

  return grouped;
}
