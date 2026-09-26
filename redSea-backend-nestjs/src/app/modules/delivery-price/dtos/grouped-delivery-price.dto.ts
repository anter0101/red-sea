import { ApiProperty } from '@nestjs/swagger';
import { BaseDTO } from 'src/core/utils/base.dto';
import { DeliveryPriceDTO } from './delivery-price.dto';

export class AreaDeliveryPricesDTO extends BaseDTO {
  @ApiProperty({ description: 'اسم المنطقة', example: 'العريش' })
  name: string;

  @ApiProperty({ type: () => [DeliveryPriceDTO], description: 'أسعار التوصيل في المنطقة' })
  deliveryPrices: DeliveryPriceDTO[];
}

export class GovernmentDeliveryPricesDTO extends BaseDTO {
  @ApiProperty({ description: 'اسم المحافظة', example: 'شمال سيناء' })
  name: string;

  @ApiProperty({
    type: () => [AreaDeliveryPricesDTO],
    description: 'المناطق داخل المحافظة مع أسعار التوصيل',
  })
  areas: AreaDeliveryPricesDTO[];
}
