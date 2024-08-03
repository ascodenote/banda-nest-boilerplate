import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { SharedModule } from './shares/modules/shared.module';

@Module({
  imports: [AuthModule, UserModule, SharedModule],
})
export class AppModule {}
