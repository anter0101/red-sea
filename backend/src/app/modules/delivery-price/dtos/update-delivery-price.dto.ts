import { PartialType } from '@nestjs/swagger';
import { CreateDeliveryPriceDTO } from './create-delivery-price.dto';

export class UpdateDeliveryPriceDTO extends PartialType(CreateDeliveryPriceDTO) {}
