import { SecurityModule } from '@infrastructure/security/security.module';
import { AuthModule } from '@modules/auth/auth.model';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { SequelizeModule } from '@nestjs/sequelize';
import { AllExceptionsFilter } from '@presentation/http/fillters/all-exceptions.filter';
import { DomainExceptionFilter } from '@presentation/http/fillters/domain-exception.filter';
import { HttpExceptionFilter } from '@presentation/http/fillters/http-exception.filter';
import { LoggingInterceptor } from '@presentation/http/interceptors/logging.interceptor';
import { TransformInterceptor } from '@presentation/http/interceptors/transform.interceptor';

@Module({
  imports: [
    // Environment configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database configuration
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'esss_learning',
      autoLoadModels: true,
      synchronize: false, // Use migrations instead
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
    }),

    // AuthModule
    AuthModule,
    // SecurityModules
    SecurityModule,
  ],
  controllers: [],
  providers: [
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_FILTER, useClass: DomainExceptionFilter },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  ],
})
export class AppModule {}
