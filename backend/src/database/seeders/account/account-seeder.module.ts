import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from 'src/app/modules/account/account.entity';
import { AccountSeederService } from './account-seeder.service';

@Module({
  imports: [TypeOrmModule.forFeature([Account])],
  providers: [AccountSeederService],
  exports: [AccountSeederService],
})
export class AccountSeederModule {}
