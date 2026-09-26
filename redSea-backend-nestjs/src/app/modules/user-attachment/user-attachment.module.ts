import { Module } from '@nestjs/common';
import { UserAttachmentController } from './user-attachment.controller';
import { UserAttachmentService } from './user-attachment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAttachment } from './user-attachment.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserAttachment]), UserModule],
  controllers: [UserAttachmentController],
  providers: [UserAttachmentService],
})
export class UserAttachmentModule {}
