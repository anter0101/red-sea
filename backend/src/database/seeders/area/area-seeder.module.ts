import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AreaSeederService } from './area-seeder.service';
import { Area } from 'src/app/modules/area/area.entity'; // adjust path if needed
import { Government } from 'src/app/modules/government/government.entity'; // adjust path if needed

@Module({
  imports: [TypeOrmModule.forFeature([Area, Government])],
  providers: [AreaSeederService],
  exports: [AreaSeederService],
})
export class AreaSeederModule {}
