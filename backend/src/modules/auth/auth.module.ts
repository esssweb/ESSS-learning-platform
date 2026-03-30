import { Module } from '@nestjs/common';
import {
  EMAIL_SERVICE,
  HASH_SERVICE,
  TOKEN_SERVICE,
} from '../../core/application/ports/tokens';
import { SendVerificationOtpUseCase } from '../../core/application/use-cases/auth/send-verification-otp.use-case';
import { VerifyOtpUseCase } from '../../core/application/use-cases/auth/verify-otp.use-case';
import { RegisterUseCase } from '../../core/application/use-cases/auth/register.use-case';
import { LoginUseCase } from '../../core/application/use-cases/auth/login.use-case';
import { LogoutUseCase } from '../../core/application/use-cases/auth/logout.use-case';
import { RefreshTokenUseCase } from '../../core/application/use-cases/auth/refresh-token.use-case';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { BcryptHashService } from '../../infrastructure/security/services/bcrypt-hash.service';
import { JwtTokenService } from '../../infrastructure/security/services/jwt-token.service';
import { NodemailerEmailService } from '../../infrastructure/external-services/email/email.service';
import { AuthController } from '../../presentation/http/controllers/auth/auth.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [AuthController],
  providers: [
    SendVerificationOtpUseCase,
    VerifyOtpUseCase,
    RegisterUseCase,
    LoginUseCase,
    LogoutUseCase,
    RefreshTokenUseCase,
    {
      provide: HASH_SERVICE,
      useClass: BcryptHashService,
    },
    {
      provide: TOKEN_SERVICE,
      useClass: JwtTokenService,
    },
    {
      provide: EMAIL_SERVICE,
      useClass: NodemailerEmailService,
    },
  ],
  exports: [RegisterUseCase, LoginUseCase, LogoutUseCase, RefreshTokenUseCase],
})
export class AuthModule {}
