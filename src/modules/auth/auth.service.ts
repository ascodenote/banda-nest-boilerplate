import { Injectable } from '@nestjs/common';
import { CreateUserInputDto } from '../user/dto/create-user-input.dto';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(private usersService: UserService) {}

  async create(createAuthDto: CreateUserInputDto): Promise<User> {
    return await this.usersService.create(createAuthDto);
  }
}
