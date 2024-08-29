import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('auth.secret'),
    });
  }

  async validate(payload: any) {
    // only runs if the token is valid and successfully verified.
    // If the token is valid, the validate method is called with the decoded payload.
    // console.log('hihi');
    // Optionally, you can perform additional checks here, such as checking if
    // the user exists, is banned, whatever.
    console.log(payload);
    const user = await this.usersService.findOne(payload.email);
    // console.log(user.role.name);
    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
