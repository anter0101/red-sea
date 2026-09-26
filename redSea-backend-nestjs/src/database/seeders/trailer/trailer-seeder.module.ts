import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trailer } from 'src/app/modules/trailer/trailer.entity';
import { TrailerSeederService } from './trailer-seeder.service';

@Module({
  imports: [TypeOrmModule.forFeature([Trailer])],
  providers: [TrailerSeederService],
  exports: [TrailerSeederService],
})
export class TrailerSeederModule {}
