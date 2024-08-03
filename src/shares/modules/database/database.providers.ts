import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async (configService: ConfigService) => {
      const dbConfig = configService.get('db');
      const dataSource = new DataSource(dbConfig);

      return dataSource.initialize();
    },
    inject: [ConfigService],
  },
];
