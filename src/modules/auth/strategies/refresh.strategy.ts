import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/modules/user/user.service';

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
          // Mengambil token dari cookie dengan nama 'refreshToken'
          const refreshToken = request.cookies?.refreshToken;
          if (!refreshToken) {
            console.warn('No refresh token found in cookies');
          }
          return refreshToken || null;
        },
      ]),
    });
  }

  async validate(request: Request, payload: any) {
    if (!payload) {
      throw new BadRequestException('Invalid JWT token');
    }

    const getUser = await this.usersService.findOneByID(payload.sub);
    console.log('Strategy', getUser);
    return getUser;
  }
}
