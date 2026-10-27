import { Controller, Get, INestApplication, UseGuards } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { UserRole } from 'src/core/enums/user-role';
import { Roles } from 'src/core/security/decorators/roles.decorator';
import { AuthGuard } from 'src/core/security/guards/auth.guard';
import { RolesGuard } from 'src/core/security/guards/roles.guard';
import { JwtPayload } from 'src/core/security/interfaces/jwt-payload.interface';
import { JwtStrategy } from 'src/core/security/passport.jwt.strategy';
import { AuthService } from './auth.service';

const SECRET = 'stage-2-auth-guard-test-secret';

@Controller('secure')
@UseGuards(AuthGuard, RolesGuard)
class SecureProbeController {
  @Get('admin')
  @Roles(UserRole.ADMIN)
  admin(): { ok: true } {
    return { ok: true };
  }
}

describe('AuthGuard and RolesGuard', () => {
  let app: INestApplication;
  let jwt: JwtService;

  beforeAll(async () => {
    process.env.APP_SECRET_KEY = SECRET;

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [() => ({ APP_SECRET_KEY: SECRET })],
        }),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: SECRET,
          signOptions: { expiresIn: '1h' },
        }),
      ],
      controllers: [SecureProbeController],
      providers: [
        JwtStrategy,
        AuthGuard,
        RolesGuard,
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn((payload: JwtPayload) => ({
              id: payload.id,
              username: payload.username,
              role: payload.role,
            })),
          },
        },
      ],
    }).compile();

    jwt = moduleRef.get(JwtService);
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  function bearer(role: UserRole): string {
    const token = jwt.sign({ id: 7, username: 'guard-user', role });
    return `Bearer ${token}`;
  }

  it('returns 401 when the request has no token', async () => {
    await request(app.getHttpServer()).get('/secure/admin').expect(401);
  });

  it('returns 401 when the token is not a valid JWT', async () => {
    await request(app.getHttpServer())
      .get('/secure/admin')
      .set('Authorization', 'Bearer not-a-jwt')
      .expect(401);
  });

  it('returns 401 when the token is signed with a different secret', async () => {
    const other = new JwtService({ secret: 'different-secret', signOptions: { expiresIn: '1h' } });
    const token = other.sign({ id: 7, username: 'guard-user', role: UserRole.ADMIN });

    await request(app.getHttpServer())
      .get('/secure/admin')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);
  });

  it('returns 403 when the token role is not allowed', async () => {
    await request(app.getHttpServer())
      .get('/secure/admin')
      .set('Authorization', bearer(UserRole.USER))
      .expect(403);
  });

  it('returns 200 when the token role is allowed', async () => {
    await request(app.getHttpServer())
      .get('/secure/admin')
      .set('Authorization', bearer(UserRole.ADMIN))
      .expect(200);
  });
});
