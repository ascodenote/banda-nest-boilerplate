import {
  Controller,
  Post,
  Body,
  UseGuards,
  Res,
  Req,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateUserInputDto } from '../user/dto/create-user-input.dto';
import { LoginInputDto } from './dto/login-input.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Public } from './decorators/public.decorator';
import { JwtRefreshGuard } from './guards/refresh-auth.guard';
import { Refresh } from './decorators/refresh.decorator';

@ApiTags('Auth')
@Controller('auth')
@Public()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async create(@Body() createAuthDto: CreateUserInputDto) {
    return await this.authService.create(createAuthDto);
  }

  @Post('/login')
  @UseGuards(LocalAuthGuard)
  async login(@Body() createAuthDto: LoginInputDto, @Req() req, @Res() res) {
    const loginResult = await this.authService.login(req.user);

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

  @Get('refresh')
  @Refresh()
  @UseGuards(JwtRefreshGuard)
  @ApiOperation({ description: 'Refresh Token' })
  // @HttpCode(HttpStatus.OK)
  async refresh(@Req() req, @Res() res) {
    console.log('dsadsadsad', req.user);

    const user = req.user;
    const token = await this.authService.validateRefreshToken(user.sub);

    // return res.send({ accessToken: token.accessToken });
    // res.cookie('refreshToken', token.refreshToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'strict',
    // });
    res.cookie('refreshToken', token.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    return res.send({ accessToken: token.accessToken });
  }
}
