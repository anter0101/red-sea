import { Test } from '@nestjs/testing';
import { CanActivate, ExecutionContext, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Reflector } from '@nestjs/core';

import { AuthGuard, RolesGuard } from 'src/core/security';
import { UserRole } from 'src/core/enums/user-role';
import { createLocalizedValidationPipe } from 'src/i18n/localized-validation.pipe';

import { GridsController } from './grid.controller';
import { GridsService } from './grid.service';

const authUser = { id: 7, email: 'user@test.com', role: UserRole.USER };

const authGuardMock: CanActivate = {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    req.user = authUser;
    return true;
  },
};

const rolesGuardMock: CanActivate = {
  canActivate: () => true,
};

describe('GridsController', () => {
  let app: INestApplication;
  let gridsService: {
    findByFields: jest.Mock;
    findAndCount: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
    findById: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(async () => {
    gridsService = {
      findByFields: jest.fn(),
      findAndCount: jest.fn().mockResolvedValue([[], 0]),
      save: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [GridsController],
      providers: [{ provide: GridsService, useValue: gridsService }, Reflector],
    })
      .overrideGuard(AuthGuard)
      .useValue(authGuardMock)
      .overrideGuard(RolesGuard)
      .useValue(rolesGuardMock)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(createLocalizedValidationPipe());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET by-page-key returns 200 with empty columns when no prefs exist', async () => {
    gridsService.findByFields.mockResolvedValue(undefined);

    const res = await request(app.getHttpServer()).get('/api/grids/by-page-key/trips').expect(200);

    expect(res.body).toEqual({ pageKey: 'trips', columns: [] });
    expect(gridsService.findByFields).toHaveBeenCalledWith({
      where: { pageKey: 'trips', user: { id: authUser.id } },
      relations: ['user'],
    });
  });

  it('GET by-page-key returns grid when found', async () => {
    gridsService.findByFields.mockResolvedValue({
      id: 1,
      pageKey: 'trips',
      columns: ['delegateNumber', 'driverName'],
      user: authUser,
    });

    const res = await request(app.getHttpServer()).get('/api/grids/by-page-key/trips').expect(200);

    expect(res.body.pageKey).toBe('trips');
    expect(res.body.columns).toEqual(['delegateNumber', 'driverName']);
  });

  it('POST creates grid for USER', async () => {
    gridsService.save.mockResolvedValue({
      id: 2,
      pageKey: 'cars',
      columns: ['carCode'],
      user: authUser,
    });

    const res = await request(app.getHttpServer())
      .post('/api/grids')
      .send({ pageKey: 'cars', columns: ['carCode'] })
      .expect(201);

    expect(res.body.pageKey).toBe('cars');
    expect(gridsService.save).toHaveBeenCalledWith(
      expect.objectContaining({ pageKey: 'cars', columns: ['carCode'] }),
      authUser.email,
    );
  });

  it('PUT upserts when grid is missing', async () => {
    gridsService.findByFields.mockResolvedValue(undefined);
    gridsService.save.mockResolvedValue({
      id: 3,
      pageKey: 'drivers',
      columns: ['driverName'],
      user: authUser,
    });

    const res = await request(app.getHttpServer())
      .put('/api/grids')
      .send({ pageKey: 'drivers', columns: ['driverName'] })
      .expect(200);

    expect(res.body.pageKey).toBe('drivers');
    expect(gridsService.save).toHaveBeenCalled();
    expect(gridsService.update).not.toHaveBeenCalled();
  });

  it('PUT updates existing grid columns', async () => {
    const existing = {
      id: 4,
      pageKey: 'trailers',
      columns: ['old'],
      user: authUser,
    };
    gridsService.findByFields.mockResolvedValue(existing);
    gridsService.update.mockResolvedValue({
      ...existing,
      columns: ['new'],
    });

    const res = await request(app.getHttpServer())
      .put('/api/grids')
      .send({ pageKey: 'trailers', columns: ['new'] })
      .expect(200);

    expect(res.body.columns).toEqual(['new']);
    expect(gridsService.update).toHaveBeenCalled();
    expect(gridsService.save).not.toHaveBeenCalled();
  });
});
