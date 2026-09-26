import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tire } from './tire.entity';
import { TireService } from './tire.service';
import { TireController } from './tire.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Tire])],
  controllers: [TireController],
  providers: [TireService],
  exports: [TireService],
})
export class TireModule {}
