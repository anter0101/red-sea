import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaintenanceController } from './maintenance.controller';
import { MaintenanceService } from './maintenance.service';
import { Maintenance } from './maintenance.entity';
import { Car } from '../car/car.entity';
import { Trailer } from '../trailer/trailer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Maintenance, Car, Trailer])],
  controllers: [MaintenanceController],
  providers: [MaintenanceService],
  exports: [MaintenanceService],
})
export class MaintenanceModule {}
