import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DeliveryPrice } from './delivery-price.entity';
import { DeliveryPriceService } from './delivery-price.service';
import { DeliveryPriceController } from './delivery-price.controller';
import { ClientModule } from '../factory/client.module';
import { AreaModule } from '../area/area.module';
import { PriceTypeModule } from '../price-type/price-type.module';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryPrice]), ClientModule, AreaModule, PriceTypeModule],
  controllers: [DeliveryPriceController],
  providers: [DeliveryPriceService],
  exports: [DeliveryPriceService],
})
export class DeliveryPriceModule {}
