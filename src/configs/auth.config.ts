import { registerAs } from '@nestjs/config';
import { AuthConfig } from './config.type';

export default registerAs<AuthConfig>('auth', () => ({
  secret: process.env.AUTH_JWT_SECRET,
  expires: process.env.AUTH_JWT_TOKEN_EXPIRES_IN,
  refreshSecret: process.env.AUTH_REFRESH_SECRET,
  refreshExpires: process.env.AUTH_JWT_REFRESH_EXPIRES_IN,
  forgotSecret: process.env.AUTH_FORGOT_SECRET,
  forgotExpires: process.env.AUTH_FORGOT_TOKEN_EXPIRES_IN,
  confirmEmailSecret: process.env.AUTH_CONFIRM_EMAIL_SECRET,
  confirmEmailExpires: process.env.AUTH_CONFIRM_EMAIL_TOKEN_EXPIRES_IN,
}));
