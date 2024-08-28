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
        secret: this.configService.getOrThrow('auth.confirm', {
          infer: true,
        }),
        expiresIn: this.configService.getOrThrow('auth.confirm_exp', {
          infer: true,
        }),
      },
    );
    console.log(hash);
    await this.mailService.sendUserConfirmation(user, hash);
    return user;
  }

  async validateUser({ username, password }: LoginInputDto) {
    const user = await this.usersService.findOne(username, true);
    if (!user) {
      return null;
    }

    // Cek apakah user aktif
    if (user.accountStatus !== AccountStatus.Active) {
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

  async confirmEmail(hash: string): Promise<void> {
    let userId: User['id'];

    try {
      const jwtData = await this.jwtService.verifyAsync<{
        confirmEmailUserId: User['id'];
      }>(hash, {
        secret: this.configService.getOrThrow('auth.confirm', {
          infer: true,
        }),
      });

      userId = jwtData.confirmEmailUserId;
    } catch {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          hash: `invalidHash`,
        },
      });
    }

    const user = await this.usersService.findOneByID(userId);

    if (!user || user?.accountStatus !== AccountStatus.Inactive) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        error: `notFound`,
      });
    }

    user.accountStatus = AccountStatus.Active;

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
