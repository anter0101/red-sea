import { Controller, Get, Res } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import type { Response } from 'express';
import { DataSource } from 'typeorm';

type HealthBody = {
  status: 'ok' | 'down';
  db: 'up' | 'down';
  redis: 'up' | 'down';
  color: string;
  sha: string;
};

@Controller('api/health')
export class HealthController {
  constructor(
    private readonly dataSource: DataSource,
    @InjectQueue('gps-sync') private readonly gpsQueue: Queue,
  ) {}

  @Get()
  async getHealth(@Res() res: Response): Promise<void> {
    const body: HealthBody = {
      status: 'ok',
      db: 'up',
      redis: 'up',
      color: process.env.APP_COLOR ?? '',
      sha: process.env.APP_RELEASE_SHA ?? '',
    };

    try {
      await this.dataSource.query('SELECT 1');
    } catch {
      body.db = 'down';
    }

    try {
      const client = await this.gpsQueue.client;
      const reply = await client.ping();
      if (String(reply).toUpperCase() !== 'PONG') {
        body.redis = 'down';
      }
    } catch {
      body.redis = 'down';
    }

    if (body.db !== 'up' || body.redis !== 'up') {
      body.status = 'down';
      res.status(503).json(body);
      return;
    }

    res.status(200).json(body);
  }
}
