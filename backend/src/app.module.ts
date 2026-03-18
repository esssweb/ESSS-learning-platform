import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig, databaseConfig, jwtConfig, validateEnvironment } from './infrastructure/config';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [appConfig, databaseConfig, jwtConfig],
      validate: validateEnvironment,
    }),
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
