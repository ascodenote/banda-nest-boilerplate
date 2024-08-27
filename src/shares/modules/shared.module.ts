import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import appConfig from 'src/configs/app.config';
import dbConfig from 'src/configs/db.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as path from 'path';
import authConfig from 'src/configs/auth.config';
import mailConfig from 'src/configs/mail.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, dbConfig, authConfig, mailConfig],
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      useFactory: (configService: ConfigService) => ({
        // type: 'mysql',
        // host: configService.get<string>('db.host'),
        // port: configService.get<number>('db.port'),
        // username: configService.get<string>('db.username'),
        // password: configService.get<string>('db.password'),
        // database: configService.get<string>('db.database'),
        type: 'sqlite',
        database: 'database.sqlite',
        entities: [path.join(__dirname, '../../**/*.entity{.ts,.js}')],
        // entities: [User, Role, Permission],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [ConfigModule],
})
export class SharedModule {}
