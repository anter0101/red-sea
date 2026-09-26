import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RelTrailerOwner } from './rel-trailer-owner.entity';
import { RelTrailerOwnerService } from './rel-trailer-owner.services';

@Module({
  imports: [TypeOrmModule.forFeature([RelTrailerOwner])],
  providers: [RelTrailerOwnerService],
  exports: [RelTrailerOwnerService],
})
export class RelTrailerOwnerModule {}
