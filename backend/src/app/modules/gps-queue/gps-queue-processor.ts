// src/modules/gps/queue/gps.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { GpsQueueService } from './gps-queue-service';
@Processor('gps-sync')
export class GpsProcessor extends WorkerHost {
  constructor(private readonly GpsQueueService: GpsQueueService) {
    super();
  }

  async process() {
    await this.GpsQueueService.backgroundSync();
  }
}
