import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from './configs/config.type';
import { setupSwagger } from './configs/swagger.config';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService) as ConfigService<AllConfigType>;
  app.use(cookieParser());
  app.enableCors({
    origin: true,
    methods: 'GET,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  app.setGlobalPrefix(
    configService.getOrThrow('app.apiPrefix', { infer: true }),
    {
      exclude: ['/'],
    },
  );
  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  setupSwagger(app);
  await app.listen(configService.get('app.port', { infer: true }));
}
bootstrap();
