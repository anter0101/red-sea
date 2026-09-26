import { PaginateDTO } from 'src/core/utils/paginate.dto';

export class DeliveryPriceQueryDTO extends PaginateDTO {
  clientId?: number;
  areaId?: number;
  priceTypeId?: number;
}
