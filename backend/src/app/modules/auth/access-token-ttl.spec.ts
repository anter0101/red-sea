import { JwtService } from '@nestjs/jwt';
import { UserDTO } from 'src/app/modules/user/dtos/user.dto';
import { UserService } from 'src/app/modules/user/user.service';
import { ACCESS_TOKEN_TTL_SECONDS } from './access-token-ttl';
import { AuthService } from './auth.service';

describe('access token lifetime', () => {
  it('signs a 6 hour access token and does not issue a refresh token', () => {
    const sign = jest.fn().mockReturnValue('signed');
    const service = new AuthService({} as UserService, { sign } as unknown as JwtService);
    const user = { id: 3, username: 'admin', role: 'ADMIN' } as UserDTO;

    expect(service.generateToken(user)).toEqual({ access_token: 'signed' });
    expect(sign).toHaveBeenCalledTimes(1);
    expect(sign).toHaveBeenCalledWith(
      { id: 3, username: 'admin', role: 'ADMIN' },
      { expiresIn: ACCESS_TOKEN_TTL_SECONDS },
    );
    expect(ACCESS_TOKEN_TTL_SECONDS).toBe(6 * 60 * 60);
    expect(sign.mock.calls[0][1]).not.toHaveProperty('refresh');
  });
});
