import { Global, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DeviceTokenEntity, RefreshTokenEntity, UserEntity } from './entities';
import { databaseProviders } from './database.providers';

@Global()
@Module({
  imports: [
    ConfigModule,
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get('DB_HOST'),
        port: parseInt(configService.get('DB_PORT') || '5432', 10),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        autoLoadModels: true,
        synchronize: false,
        logging: configService.get('NODE_ENV') === 'development' ? console.log : false,
      }),
      inject: [ConfigService],
    }),
    SequelizeModule.forFeature([UserEntity, RefreshTokenEntity, DeviceTokenEntity]),
  ],
  providers: [...databaseProviders],
  exports: [SequelizeModule, ...databaseProviders],
})
export class DatabaseModule {}
