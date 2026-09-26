import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RelCarOwner } from './rel-car-owner.entity';
import { RelCarOwnerService } from './rel-car-owner.services';

@Module({
  imports: [TypeOrmModule.forFeature([RelCarOwner])],
  providers: [RelCarOwnerService],
  exports: [RelCarOwnerService],
})
export class RelCarOwnerModule {}
