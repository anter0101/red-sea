import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceType } from 'src/app/modules/price-type/price-type.entity';
import { PriceTypeSeederService } from './price-type-seeder.service';

@Module({
  imports: [TypeOrmModule.forFeature([PriceType])],
  providers: [PriceTypeSeederService],
  exports: [PriceTypeSeederService],
})
export class PriceTypeSeederModule {}
