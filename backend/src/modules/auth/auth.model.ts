import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { RegisterUseCase } from '../../core/application/use-cases/auth/register.use-case';
import { LoginUseCase } from '../../core/application/use-cases/auth/login.use-case';
import { LogoutUseCase } from '../../core/application/use-cases/auth/logout.use-case';
import { RefreshTokenUseCase } from '../../core/application/use-cases/auth/refresh-token.use-case';
import { SecurityModule } from '../../infrastructure/security/security.module';
import { AuthController } from '@presentation/http/controllers/auth.controller';

@Module({
  imports: [SecurityModule, DatabaseModule],
  controllers: [AuthController],
  providers: [RegisterUseCase, LoginUseCase, LogoutUseCase, RefreshTokenUseCase],
})
export class AuthModule {}
