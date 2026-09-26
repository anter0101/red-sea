// src/modules/gps/queue/gps-queue.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { GpsProcessor } from './gps-queue-processor';
import { GpsQueueService } from './gps-queue-service';
import { GpsDeviceModule } from '../gps-device/gps-device.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'gps-sync',
    }),
    GpsDeviceModule,
    HttpModule,
  ],
  providers: [GpsProcessor, GpsQueueService],
  exports: [GpsQueueService],
})
export class GpsQueueModule {}
