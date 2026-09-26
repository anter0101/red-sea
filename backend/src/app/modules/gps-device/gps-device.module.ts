import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GpsDevice } from './gps-device.entity';
import { GpsDeviceService } from './gps-device.service';
import { GpsDeviceController } from './gps-device.controller';
import { HttpModule } from '@nestjs/axios';
import { CarModule } from '../car/car.module';

@Module({
  imports: [TypeOrmModule.forFeature([GpsDevice]), HttpModule, CarModule],
  controllers: [GpsDeviceController],
  providers: [GpsDeviceService],
  exports: [GpsDeviceService],
})
export class GpsDeviceModule {}
