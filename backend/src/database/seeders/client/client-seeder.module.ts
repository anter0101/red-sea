import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from 'src/app/modules/factory/client.entity';
import { ClientSeederService } from './client-seeder.service';

@Module({
  imports: [TypeOrmModule.forFeature([Client])],
  providers: [ClientSeederService],
  exports: [ClientSeederService],
})
export class ClientSeederModule {}
