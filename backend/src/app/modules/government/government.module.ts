import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Government } from './government.entity';
import { GovernmentService } from './government.service';
import { GovernmentController } from './government.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Government])],
  controllers: [GovernmentController],
  providers: [GovernmentService],
  exports: [GovernmentService],
})
export class GovernmentModule {}
