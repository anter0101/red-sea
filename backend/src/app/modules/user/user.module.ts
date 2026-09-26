import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Contact } from '../contact/contact.entity';
import { ContactService } from '../contact/contact.service';
import { AccountModule } from '../account/account.module';
import { Journey } from '../journey/journey.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Contact, Journey]), AccountModule],
  controllers: [UserController],
  providers: [UserService, ContactService],
  exports: [UserService],
})
export class UserModule {}
