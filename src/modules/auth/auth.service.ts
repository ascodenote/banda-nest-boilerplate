import { Injectable } from '@nestjs/common';
import { CreateUserInputDto } from '../user/dto/create-user-input.dto';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { LoginInputDto } from './dto/login-input.dto';
import { comparePassword } from 'src/shares/utils/encryption.util';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async create(createAuthDto: CreateUserInputDto): Promise<User> {
    return await this.usersService.create(createAuthDto);
  }

  async validateUser({ username, password }: LoginInputDto) {
    const user = await this.usersService.findOne(username, true);
    if (!user) {
      return null;
    }

    try {
      const isMatch = await comparePassword(password, user.password);
      if (!isMatch) {
        return null;
      }
    } catch (error) {
      return null;
    }

    delete (user as Partial<User>).password;

    return user;
  }

  async login(user: any) {
    // console.log(user);
    const payload = { username: user.username, sub: user.id };

    const token = await this.getJwtToken(payload);
    return {
      data: payload,
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
    };
  }

  async validateRefreshToken(sub, token): Promise<any> {
    const getUser = await this.usersService.findOneByID(sub);

    // const isValidToken = await AuthHelpers.verify(token, getUser.hashToken);

    // // const isValidToken = await bcrypt.compare(token, user.hashToken);
    // // console.log(isValidToken);

    // if (!isValidToken) {
    //   throw new HttpException('Token Expired', HttpStatus.UNAUTHORIZED);
    // }

    // const payload = {
    //   sub: getUser.id,
    //   firstName: getUser.firstName,
    //   lastName: getUser.lastName,
    //   email: getUser.email,
    //   role: getUser.role,
    // };

    // const tokens = await this.getJwtToken(payload);

    // return {
    //   accessToken: tokens.accessToken,
    // };
  }

  async getJwtToken(user: any) {
    const payload = {
      ...user,
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.sign(payload),
      this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: this.configService.get('auth.refresh_exp'),
      }),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }

  // async removeRefreshToken(sub) {
  //   return await this.prisma.user.update({
  //     where: { id: sub },
  //     data: {
  //       hashToken: null,
  //     },
  //   });
  // }
}
