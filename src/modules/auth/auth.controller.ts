import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

import { ApiTags } from '@nestjs/swagger';
import { CreateUserInputDto } from '../user/dto/create-user-input.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiTags('Auth')
  @Post()
  create(@Body() createAuthDto: CreateUserInputDto) {
    return this.authService.create(createAuthDto);
  }
}
