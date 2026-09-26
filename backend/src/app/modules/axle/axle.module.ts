import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Axle } from './axle.entity';
import { AxleService } from './axle.service';
import { AxleController } from './axle.controller';
import { Tire } from '../tire/tire.entity';
import { TrailerModule } from '../trailer/trailer.module';
import { CarModule } from '../car/car.module';

@Module({
  imports: [TypeOrmModule.forFeature([Axle, Tire]), TrailerModule, CarModule],
  controllers: [AxleController],
  providers: [AxleService],
  exports: [AxleService],
})
export class AxleModule {}
