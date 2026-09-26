import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarModel } from './car-model.entity';
import { CarModelController } from './car-model.controller';
import { CarModelService } from './car-model.service';
import { CarManufacturerModule } from '../car-manufacturer/car-manufacturer.module';

@Module({
  imports: [TypeOrmModule.forFeature([CarModel]), CarManufacturerModule],
  controllers: [CarModelController],
  providers: [CarModelService],
  exports: [CarModelService],
})
export class CarModelModule {}
