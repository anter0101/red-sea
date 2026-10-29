import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Equal } from 'typeorm';
import { UserService } from 'src/app/modules/user/user.service';
import { AuthLoginDTO } from './dto/auth-login.dto';
import { JwtPayload } from 'src/core/security/interfaces/jwt-payload.interface';
import { UserDTO } from 'src/app/modules/user/dtos/user.dto';
import { GeneratedToken } from 'src/core/security/interfaces/token.interface';
import { ACCESS_TOKEN_TTL_SECONDS } from './access-token-ttl';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(userLogin: AuthLoginDTO): Promise<GeneratedToken> {
    const loginEmail = userLogin.email;
    const loginPassword = userLogin.password;

    const userFind = await this.userService.findByFields({
      where: { email: Equal(loginEmail) },
    });

    const validPassword = !!userFind && (await bcrypt.compare(loginPassword, userFind.password));
    if (!userFind || !validPassword) {
      throw new HttpException('Invalid login email or password!', HttpStatus.UNAUTHORIZED);
    }

    if (userFind && !userFind.activated) {
      throw new HttpException('Your account is not been activated!', HttpStatus.BAD_REQUEST);
    }

    return this.generateToken(userFind);
  }

  async validateUser(payload: JwtPayload) {
    return await this.userService.findByFields({
      where: { id: Equal(payload.id) },
    });
  }

  generateToken(user: UserDTO): GeneratedToken {
    const payload: JwtPayload = {
      id: user.id,
      username: user.username,
      role: user.role,
    };
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: ACCESS_TOKEN_TTL_SECONDS }),
    };
  }
}
