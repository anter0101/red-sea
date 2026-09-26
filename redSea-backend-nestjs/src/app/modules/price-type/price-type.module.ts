import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PriceType } from './price-type.entity';
import { PriceTypeService } from './price-type.service';
import { PriceTypeController } from './price-type.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PriceType])],
  controllers: [PriceTypeController],
  providers: [PriceTypeService],
  exports: [PriceTypeService],
})
export class PriceTypeModule {}
