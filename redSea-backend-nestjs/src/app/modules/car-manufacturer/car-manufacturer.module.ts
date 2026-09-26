import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarManufacturer } from './car-manufacturer.entity';
import { CarManufacturerController } from './car-manufacturer.controller';
import { CarManufacturerService } from './car-manufacturer.service';

@Module({
  imports: [TypeOrmModule.forFeature([CarManufacturer])],
  controllers: [CarManufacturerController],
  providers: [CarManufacturerService],
  exports: [CarManufacturerService],
})
export class CarManufacturerModule {}
