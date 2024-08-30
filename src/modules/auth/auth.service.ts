import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateUserInputDto } from '../user/dto/create-user-input.dto';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { LoginInputDto } from './dto/login-input.dto';
import { comparePassword } from 'src/shares/utils/encryption.util';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
import { AccountStatus } from '../user/enums/user.enum';
import * as ms from 'ms';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  async create(createAuthDto: CreateUserInputDto): Promise<User> {
    const user = await this.usersService.create(createAuthDto);

    const hash = await this.jwtService.signAsync(
      {
        confirmEmailUserId: user.id,
      },
      {
        secret: this.configService.getOrThrow('auth.confirmEmailSecret', {
          infer: true,
        }),
        expiresIn: this.configService.getOrThrow('auth.confirmEmailExpires', {
          infer: true,
        }),
      },
    );

    await this.mailService.userSignUp({
      to: createAuthDto.email,
      data: {
        hash,
      },
    });

    return user;
  }

  async validateUser({ email, password }: LoginInputDto) {
    const user = await this.usersService.findOne(email, true);
    console.log(user);
    if (!user) {
      return null;
    }

    // Cek apakah user aktif
    // if (user.accountStatus !== AccountStatus.Active) {
    //   return null;
    // }

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
    const payload = { email: user.email, sub: user.id };

    const token = await this.getJwtToken(payload);
    return {
      data: payload,
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
    };
  }

  async confirmEmail(hash: string): Promise<void> {
    let userId: User['id'];

    try {
      const jwtData = await this.jwtService.verifyAsync<{
        confirmEmailUserId: User['id'];
      }>(hash, {
        secret: this.configService.getOrThrow('auth.confirmEmailSecret', {
          infer: true,
        }),
      });

      userId = jwtData.confirmEmailUserId;
      console.log(userId);
    } catch {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          hash: `invalidHash`,
        },
      });
    }

    const user = await this.usersService.findOneByID(userId);
    console.log(user);
    if (!user || user?.accountStatus !== AccountStatus.Inactive) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        error: `notFound`,
      });
    }

    user.accountStatus = AccountStatus.Active;

    await this.usersService.update(user.id, user);
  }

  async forgetPassword(email: string): Promise<void> {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          email: 'emailNotExists',
        },
      });
    }

    const tokenExpiresIn = this.configService.getOrThrow('auth.forgotExpires', {
      infer: true,
    });
    const tokenExpires = Date.now() + ms(tokenExpiresIn);
    console.log(tokenExpires);

    const hash = await this.jwtService.signAsync(
      {
        forgotUserId: user.id,
      },
      {
        secret: this.configService.getOrThrow('auth.forgotSecret', {
          infer: true,
        }),
        expiresIn: tokenExpiresIn,
      },
    );

    await this.mailService.forgotPassword({
      to: email,
      data: {
        hash,
        tokenExpires,
      },
    });
  }

  async resetPassword(hash: string, password: string): Promise<void> {
    let userId: User['id'];

    try {
      const jwtData = await this.jwtService.verifyAsync<{
        forgotUserId: User['id'];
      }>(hash, {
        secret: this.configService.getOrThrow('auth.forgotSecret', {
          infer: true,
        }),
      });

      userId = jwtData.forgotUserId;
    } catch {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          hash: `invalidHash`,
        },
      });
    }

    const user = await this.usersService.findOneByID(userId);

    if (!user) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          hash: `notFound`,
        },
      });
    }

    user.password = password;

    await this.usersService.update(user.id, user);
  }

  async validateRefreshToken(sub: any): Promise<any> {
    console.log(sub);
    const getUser = await this.usersService.findOneByID(sub);
    // console.log(getUser);
    // const isValidToken = await AuthHelpers.verify(token, getUser.hashToken);
    // // const isValidToken = await bcrypt.compare(token, user.hashToken);
    // // console.log(isValidToken);
    if (!getUser) {
      throw new HttpException('Token Expired', HttpStatus.UNAUTHORIZED);
    }

    const payload = {
      sub: getUser.id,
      role: getUser.role,
    };
    const tokens = await this.getJwtToken(payload);

    return {
      data: payload,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async getJwtToken(user: any) {
    console.log(this.configService.get('auth.refreshExpires'));
    const payload = {
      ...user,
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.sign(payload),
      this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: this.configService.get('auth.refreshExpires'),
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
