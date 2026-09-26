// src/trailer-attachment/trailer-attachment.module.ts
import { Module } from '@nestjs/common';
import { TrailerAttachmentController } from './trailer-attachment.controller';
import { TrailerAttachmentService } from './trailer-attachment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrailerAttachment } from './trailer-attachment.entity';
import { TrailerModule } from '../trailer/trailer.module';

@Module({
  imports: [TypeOrmModule.forFeature([TrailerAttachment]), TrailerModule],
  controllers: [TrailerAttachmentController],
  providers: [TrailerAttachmentService],
  exports: [TrailerAttachmentService],
})
export class TrailerAttachmentModule {}
