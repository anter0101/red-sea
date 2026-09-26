import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { isGpsSyncEnabled } from '../gps-device/gps-sync.enabled';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectQueue('gps-sync')
    private readonly gpsQueue: Queue,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async syncGps() {
    if (!isGpsSyncEnabled()) {
      return;
    }

    this.logger.debug('Enqueuing GPS sync job');
    await this.gpsQueue.add(
      'gps-sync-job',
      {},
      {
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: true,
        removeOnFail: true,
        delay: 1000,
        attempts: 5,
      },
    );
  }

  @Cron(CronExpression.EVERY_HOUR)
  async cleanOldJobs() {
    this.logger.debug('Cleaning old GPS sync jobs');
    await this.gpsQueue.clean(3600 * 1000, 1000, 'completed'); // 1 hour
    await this.gpsQueue.clean(24 * 3600 * 1000, 1000, 'failed'); // 24 hours
  }
}
