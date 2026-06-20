import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  AuthEntity,
  DeviceTokenEntity,
  RefreshTokenEntity,
  UserEntity,
} from './entities';
import { databaseProviders } from './database.providers';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        autoLoadModels: true,
        synchronize: false,
        logging: configService.get('NODE_ENV') === 'development' ? console.log : false,
      }),
      inject: [ConfigService],
    }),
    SequelizeModule.forFeature([
      AuthEntity,
      UserEntity,
      RefreshTokenEntity,
      DeviceTokenEntity,
    ]),
  ],
  providers: [...databaseProviders],
  exports: [SequelizeModule, ...databaseProviders],
})
export class DatabaseModule {}
