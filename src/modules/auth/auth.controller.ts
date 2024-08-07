import { Controller, Post, Body, UseGuards, Res, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateUserInputDto } from '../user/dto/create-user-input.dto';
import { LoginInputDto } from './dto/login-input.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Public } from './decorators/public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/register')
  async create(@Body() createAuthDto: CreateUserInputDto) {
    return await this.authService.create(createAuthDto);
  }

  @Public()
  @Post('/login')
  @UseGuards(LocalAuthGuard)
  async login(@Body() createAuthDto: LoginInputDto, @Req() req, @Res() res) {
    const loginResult = await this.authService.login(req.user);
    console.log(loginResult);

    res.cookie('accessToken', loginResult.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.cookie('refreshToken', loginResult.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.json({
      data: loginResult.data,
      message: 'Login successful',
    });
  }
}
