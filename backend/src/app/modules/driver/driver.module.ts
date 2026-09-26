import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriverController } from './driver.controller';
import { DriverService } from './driver.service';
import { Driver } from './driver.entity';
import { UserModule } from '../user/user.module';
import { User } from '../user/user.entity';
import { ContactModule } from '../contact/contact.module';
import { AccountModule } from '../account/account.module';
import { Journey } from '../journey/journey.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Driver, User, Journey]),
    UserModule,
    ContactModule,
    AccountModule,
  ],
  controllers: [DriverController],
  providers: [DriverService],
  exports: [DriverService],
})
export class DriverModule {}
