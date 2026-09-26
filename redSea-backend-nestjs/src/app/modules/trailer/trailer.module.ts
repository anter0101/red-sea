import { forwardRef, Module } from '@nestjs/common';
import { TrailerController } from './trailer.controller';
import { TrailerService } from './trailer.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trailer } from './trailer.entity';
import { AxleModule } from '../axle/axle.module';

@Module({
  imports: [TypeOrmModule.forFeature([Trailer]), forwardRef(() => AxleModule)],
  controllers: [TrailerController],
  providers: [TrailerService],
  exports: [TrailerService],
})
export class TrailerModule {}
