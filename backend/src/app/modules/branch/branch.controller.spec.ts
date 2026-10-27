import { Test } from '@nestjs/testing';
import { CanActivate, ExecutionContext, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AuthGuard, RolesGuard } from 'src/core/security';
import { UserRole } from 'src/core/enums/user-role';
import { BranchController } from './branch.controller';
import { BranchService } from './branch.service';
import { AccountService } from '../account/account.service';
import { createLocalizedValidationPipe } from 'src/i18n/localized-validation.pipe';

const authGuardMock: CanActivate = {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    req.user = { id: 1, email: 'admin@test.com', role: UserRole.ADMIN };
    return true;
  },
};

const rolesGuardMock: CanActivate = {
  canActivate: () => true,
};

describe('BranchController — POST /api/branches', () => {
  let app: INestApplication;
  let branchService: {
    findByFields: jest.Mock;
    save: jest.Mock;
  };

  beforeEach(async () => {
    branchService = {
      findByFields: jest.fn().mockResolvedValue(undefined),
      save: jest.fn().mockResolvedValue({ id: 1, name: 'Cairo Main Branchcscs' }),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [BranchController],
      providers: [
        { provide: BranchService, useValue: branchService },
        {
          provide: AccountService,
          useValue: { createBranchAccount: jest.fn().mockResolvedValue(undefined) },
        },
      ],
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

  it('creates branch when name is provided in JSON body', async () => {
    await request(app.getHttpServer())
      .post('/api/branches')
      .send({ name: 'Cairo Main Branchcscs' })
      .expect(201);

    expect(branchService.findByFields).toHaveBeenCalledWith({
      where: { name: 'Cairo Main Branchcscs' },
    });
    expect(branchService.save).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Cairo Main Branchcscs' }),
      'admin@test.com',
    );
  });

  it('rejects duplicate branch name', async () => {
    branchService.findByFields.mockResolvedValue({ id: 2, name: 'Cairo Main Branchcscs' });

    const res = await request(app.getHttpServer())
      .post('/api/branches')
      .send({ name: 'Cairo Main Branchcscs' })
      .expect(400);

    expect(res.body.message).toContain('Cairo Main Branchcscs');
    expect(branchService.save).not.toHaveBeenCalled();
  });

  it('rejects empty name', async () => {
    await request(app.getHttpServer()).post('/api/branches').send({ name: '' }).expect(400);

    expect(branchService.save).not.toHaveBeenCalled();
  });
});
