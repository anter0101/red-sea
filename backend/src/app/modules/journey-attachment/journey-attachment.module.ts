import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JourneyAttachment } from './journey-attachment.entity';
import { JourneyAttachmentController } from './journey-attachment.controller';
import { JourneyAttachmentService } from './journey-attachment.service';
import { JourneyModule } from '../journey/journey.module';

@Module({
  imports: [TypeOrmModule.forFeature([JourneyAttachment]), JourneyModule],
  controllers: [JourneyAttachmentController],
  providers: [JourneyAttachmentService],
  exports: [JourneyAttachmentService],
})
export class JourneyAttachmentModule {}
