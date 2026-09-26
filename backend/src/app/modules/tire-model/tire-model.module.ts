import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TireModel } from './tire-model.entity';
import { TireModelController } from './tire-model.controller';
import { TireModelService } from './tire-model.service';

@Module({
  imports: [TypeOrmModule.forFeature([TireModel])],
  controllers: [TireModelController],
  providers: [TireModelService],
  exports: [TireModelService],
})
export class TireModelModule {}
