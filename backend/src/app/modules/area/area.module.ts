import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Area } from './area.entity';
import { AreaService } from './area.service';
import { AreaController } from './area.controller';
import { GovernmentModule } from '../government/government.module';

@Module({
  imports: [TypeOrmModule.forFeature([Area]), GovernmentModule],
  controllers: [AreaController],
  providers: [AreaService],
  exports: [AreaService],
})
export class AreaModule {}
