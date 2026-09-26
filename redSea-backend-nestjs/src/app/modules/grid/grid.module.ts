import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Grids } from './grid.entity';
import { GridsController } from './grid.controller';
import { GridsService } from './grid.service';

@Module({
  imports: [TypeOrmModule.forFeature([Grids])],
  controllers: [GridsController],
  providers: [GridsService],
  exports: [GridsService],
})
export class GridModule {}
