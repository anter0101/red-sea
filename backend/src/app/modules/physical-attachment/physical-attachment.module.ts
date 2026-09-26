import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhysicalAttachmentController } from './physical-attachment.controller';
import { PhysicalAttachmentService } from './physical-attachment.service';
import { PhysicalAttachment } from './physical-attachment.entity';
import { Car } from '../car/car.entity';
import { Trailer } from '../trailer/trailer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PhysicalAttachment, Car, Trailer])],
  controllers: [PhysicalAttachmentController],
  providers: [PhysicalAttachmentService],
  exports: [PhysicalAttachmentService],
})
export class PhysicalAttachmentModule {}
