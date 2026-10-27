import { INestApplication } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bullmq';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { HealthController } from './health.controller';

describe('GET /api/health', () => {
  let app: INestApplication;
  const query = jest.fn();
  const ping = jest.fn();

  beforeAll(async () => {
    process.env.APP_COLOR = 'blue';
    process.env.APP_RELEASE_SHA = 'abc123abc123abc123abc123abc123abc123abcd';

    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: DataSource, useValue: { query } },
        {
          provide: getQueueToken('gps-sync'),
          useValue: { client: Promise.resolve({ ping }) },
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  beforeEach(() => {
    query.mockReset();
    ping.mockReset();
    query.mockResolvedValue([{ '?column?': 1 }]);
    ping.mockResolvedValue('PONG');
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 200 when Postgres and Redis answer', async () => {
    const response = await request(app.getHttpServer()).get('/api/health').expect(200);

    expect(query).toHaveBeenCalledWith('SELECT 1');
    expect(response.body).toEqual({
      status: 'ok',
      db: 'up',
      redis: 'up',
      color: 'blue',
      sha: 'abc123abc123abc123abc123abc123abc123abcd',
    });
  });

  it('returns 503 when Postgres does not answer', async () => {
    query.mockRejectedValue(new Error('connection refused'));

    const response = await request(app.getHttpServer()).get('/api/health').expect(503);

    expect(response.body).toMatchObject({ status: 'down', db: 'down', redis: 'up', color: 'blue' });
  });

  it('returns 503 when Redis does not answer', async () => {
    ping.mockRejectedValue(new Error('LOADING'));

    const response = await request(app.getHttpServer()).get('/api/health').expect(503);

    expect(response.body).toMatchObject({ status: 'down', db: 'up', redis: 'down' });
  });
});
