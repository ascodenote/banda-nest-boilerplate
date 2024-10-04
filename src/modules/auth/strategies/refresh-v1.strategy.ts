import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class JwtRefreshStrategyV1 extends PassportStrategy(
  Strategy,
  'jwt-refresh-token-v1',
) {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    private usersService: UserService,
  ) {
    super({
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKey: configService.get('auth.secret'),
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const authHeader = request.headers['authorization'];
          return authHeader;
        },
      ]),
    });
  }

  async validate(request: Request, payload: any) {
    console.log(payload);
    if (!payload) {
      throw new BadRequestException('Invalid JWT token');
    }

    const getUser = await this.usersService.findOneByID(payload.sub);
    console.log('Strategy', getUser);
    return getUser;
  }
}
