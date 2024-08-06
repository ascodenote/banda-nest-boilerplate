import { Injectable } from '@nestjs/common';
import { CreateUserInputDto } from '../user/dto/create-user-input.dto';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { LoginInputDto } from './dto/login-input.dto';
import { comparePassword } from 'src/shares/utils/encryption.util';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService
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
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
