import { OmitType } from '@nestjs/swagger';
import { DeliveryPriceDTO } from './delivery-price.dto';

export class CreateDeliveryPriceDTO extends OmitType(DeliveryPriceDTO, [
  'id',
  'updatedAt',
  'client',
  'area',
  'priceType',
  'totalPrice',
] as const) {
  clientId: number;
  areaId: number;
  priceTypeId?: number;
}
