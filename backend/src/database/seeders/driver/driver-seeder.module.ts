import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from 'src/app/modules/driver/driver.entity';
import { DriverModule } from 'src/app/modules/driver/driver.module';
import { ContactModule } from 'src/app/modules/contact/contact.module';
import { DriverSeederService } from './driver-seeder.service';

@Module({
  imports: [TypeOrmModule.forFeature([Driver]), DriverModule, ContactModule],
  providers: [DriverSeederService],
  exports: [DriverSeederService],
})
export class DriverSeederModule {}
