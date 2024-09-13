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
  Version
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiTags,ApiHeader,ApiBearerAuth } from '@nestjs/swagger';
import { CreateUserInputDto } from '../user/dto/create-user-input.dto';
import { LoginInputDto } from './dto/login-input.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Public } from './decorators/public.decorator';
import { JwtRefreshGuard } from './guards/refresh-auth.guard';
import { Refresh } from './decorators/refresh.decorator';
import { ConfirmInputDto } from './dto/confirm-input.dto';
import { ForgetPasswordInputDto } from './dto/forget-password-input.dto';
import { ResetPasswordInputDto } from './dto/reset-password-input.dto';
import { JwtRefreshV1Guard } from './guards/refresh-auth-v1.guard';


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
      user: loginResult.data,
      backendTokens: {
        accessToken: loginResult.accessToken,
        refreshToken: loginResult.refreshToken,
        expiresIn: loginResult.expiresIn,
      },
    });
  }

  @Get('refresh')
  @Version('1')
  @ApiBearerAuth('Refresh') 
  @Refresh()
  @UseGuards(JwtRefreshV1Guard)
  @ApiOperation({ description: 'Refresh Token V1' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Refresh Token in the format: Refresh {token}',
    required: true,
  })
  @HttpCode(HttpStatus.OK)
  async refreshv1(@Req() req, @Res() res) {
    const user = req.user;
    const token = await this.authService.validateRefreshToken(user.id);

    res.cookie('refreshToken', token.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return res.send({ accessToken: token.accessToken });
  }

  @Get('refresh')
  @Refresh()
  @UseGuards(JwtRefreshGuard)
  @ApiOperation({ description: 'Refresh Token' })
  // @HttpCode(HttpStatus.OK)
  async refresh(@Req() req, @Res() res) {
    const user = req.user;
    const token = await this.authService.validateRefreshToken(user.id);

    // res.cookie('accessToken', token.accessToken, {
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



  @Post('email/confirm')
  @HttpCode(HttpStatus.OK)
  async confirmEmail(@Body() confirmEmailDto: ConfirmInputDto): Promise<void> {
    return this.authService.confirmEmail(confirmEmailDto.hash);
  }

  @Post('forgot/password')
  @HttpCode(HttpStatus.OK)
  async forgetPassword(
    @Body() forgetPasswordInputDto: ForgetPasswordInputDto,
  ): Promise<void> {
    return this.authService.forgetPassword(forgetPasswordInputDto.email);
  }

  @Post('reset/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  resetPassword(
    @Body() resetPasswordDto: ResetPasswordInputDto,
  ): Promise<void> {
    return this.authService.resetPassword(
      resetPasswordDto.hash,
      resetPasswordDto.password,
    );
  }
}
