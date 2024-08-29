import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';
import { CaslModule } from './modules/casl/casl.module';
import { PermissionsGuard } from './modules/auth/guards/permissions.guard';
import { JwtRefreshGuard } from './modules/auth/guards/refresh-auth.guard';
import { MailModule } from './modules/mail/mail.module';
import { MailerModule } from './shares/modules/mailer/mailer.module';
import { SharedModule } from './shares/modules/shared.module';

@Module({
  imports: [
    SharedModule,
    AuthModule,
    UserModule,
    CaslModule,
    MailModule,
    MailerModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtRefreshGuard,
    },
  ],
})
export class AppModule {}
