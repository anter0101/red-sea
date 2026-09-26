import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GpsTail } from './gps-tail.entity';
import { GpsTailService } from './gps-tail.service';
import { GpsTailController } from './gps-tail.controller';
import { GpsDevice } from '../gps-device/gps-device.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GpsTail, GpsDevice])],
  controllers: [GpsTailController],
  providers: [GpsTailService],
  exports: [GpsTailService],
})
export class GpsTailModule {}
