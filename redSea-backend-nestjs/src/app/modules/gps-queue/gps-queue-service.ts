// src/modules/gps/queue/gps-queue.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { GpsDeviceService } from '../gps-device/gps-device.service';
import { mapGpsItemsTODB } from '../gps-device/gps-device.mapper';
import { isGpsSyncEnabled } from '../gps-device/gps-sync.enabled';

@Injectable()
export class GpsQueueService {
  private readonly logger = new Logger(GpsQueueService.name);
  constructor(private readonly gpsDeviceService: GpsDeviceService) {}

  async backgroundSync() {
    if (!isGpsSyncEnabled()) {
      this.logger.debug('GPS sync skipped (GPS_SYNC_ENABLED=false)');
      return;
    }

    const externalData = await this.gpsDeviceService.getDevicesfromGps();
    const mappedDevices = mapGpsItemsTODB(externalData);
    await this.gpsDeviceService.syncDevices(mappedDevices);
    this.logger.log('GPS sync completed');
  }
}
