import { Module } from '@nestjs/common';
import { CarAttachmentController } from './car-attachment.controller';
import { CarAttachmentService } from './car-attachment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarAttachment } from './car-attachment.entity';
import { CarModule } from '../car/car.module';

@Module({
  imports: [TypeOrmModule.forFeature([CarAttachment]), CarModule],
  controllers: [CarAttachmentController],
  providers: [CarAttachmentService],
})
export class CarAttachmentModule {}
