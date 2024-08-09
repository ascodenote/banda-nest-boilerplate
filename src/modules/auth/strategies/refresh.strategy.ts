import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/modules/user/user.service';
// import { IJwtPayload } from 'src/share/types/auth.types';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
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
          // eslint-disable-next-line prettier/prettier
          return request?.cookies?.['refreshToken'];
        },
      ]),
    });
  }

  async validate(request: Request, payload: any) {
    console.log('Hiiiii on refersh strategy', payload);

    if (!payload) {
      throw new BadRequestException('invalid jwt token');
    }

    // const getUser = await this.usersService.findOneByID(payload.sub);

    // return getUser;
    return true;
  }
}
