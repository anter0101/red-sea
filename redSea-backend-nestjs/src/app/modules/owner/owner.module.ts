import { Module } from '@nestjs/common';
import { OwnerController } from './owner.controller';
import { OwnerService } from './owner.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Owner } from './owner.entity';
import { RelCarOwnerModule } from '../rel-car-owner/rel-car-owner.module';
import { RelTrailerOwnerModule } from '../rel-trailer-owner/rel-trailer-owner.module';
import { CarModule } from '../car/car.module';
import { TrailerModule } from '../trailer/trailer.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Owner]),
    RelCarOwnerModule,
    RelTrailerOwnerModule,
    CarModule,
    TrailerModule,
  ],
  controllers: [OwnerController],
  providers: [OwnerService],
  exports: [OwnerService],
})
export class OwnerModule {}
