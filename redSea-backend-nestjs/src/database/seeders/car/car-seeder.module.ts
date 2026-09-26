import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Car } from 'src/app/modules/car/car.entity';
import { CarSeederService } from './car-seeder.service';

@Module({
  imports: [TypeOrmModule.forFeature([Car])],
  providers: [CarSeederService],
  exports: [CarSeederService],
})
export class CarSeederModule {}
