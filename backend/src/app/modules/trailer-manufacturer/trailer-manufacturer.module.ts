import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrailerManufacturer } from './trailer-manufacturer.entity';
import { TrailerManufacturerController } from './trailer-manufacturer.controller';
import { TrailerManufacturerService } from './trailer-manufacturer.service';

@Module({
  imports: [TypeOrmModule.forFeature([TrailerManufacturer])],
  controllers: [TrailerManufacturerController],
  providers: [TrailerManufacturerService],
  exports: [TrailerManufacturerService],
})
export class TrailerManufacturerModule {}
