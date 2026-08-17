import { SecurityModule } from '@infrastructure/security/security.module';
import { AuthModule } from '@modules/auth/auth.module';
import { UsersModule } from '@modules/users/users.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AllExceptionsFilter } from '@presentation/http/fillters/all-exceptions.filter';
import { DomainExceptionFilter } from '@presentation/http/fillters/domain-exception.filter';
import { HttpExceptionFilter } from '@presentation/http/fillters/http-exception.filter';
import { LoggingInterceptor } from '@presentation/http/interceptors/logging.interceptor';
import { TransformInterceptor } from '@presentation/http/interceptors/transform.interceptor';
import { appConfig, databaseConfig, jwtConfig, validateEnvironment } from './infrastructure/config';
import { DatabaseModule } from './infrastructure/database/database.module';
import { JwtAuthGuard } from './infrastructure/security/guards/jwt-auth.guard';
import { RolesGuard } from './infrastructure/security/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [appConfig, databaseConfig, jwtConfig],
      validate: validateEnvironment,
    }),
    DatabaseModule,
    SecurityModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [],
  providers: [
    // Order matters: JwtAuthGuard populates request.user, RolesGuard reads it.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    // Nest evaluates global filters in REVERSE registration order, so the
    // catch-all must be registered first to be consulted last. Registering it
    // last makes it shadow every specific filter and turn all errors into 500.
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_FILTER, useClass: DomainExceptionFilter },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  ],
})
export class AppModule {}
