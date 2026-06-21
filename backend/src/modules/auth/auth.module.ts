import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
import { GoogleScriptEmailService } from '../../infrastructure/external-services/email/google-script-email.service';
import { SecurityModule } from '../../infrastructure/security/security.module';
import { AuthController } from '../../presentation/http/controllers/auth/auth.controller';

@Module({
  imports: [DatabaseModule, SecurityModule],
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
    // Email service selection:
    //   GOOGLE_SCRIPT_URL set  → GoogleScriptEmailService (recommended)
    //   SMTP_HOST set          → NodemailerEmailService
    //   neither                → NodemailerEmailService (logs OTP to console in dev)
    {
      provide: EMAIL_SERVICE,
      useFactory: (config: ConfigService) => {
        if (config.get<string>('GOOGLE_SCRIPT_URL')) {
          return new GoogleScriptEmailService(config);
        }
        return new NodemailerEmailService(config);
      },
      inject: [ConfigService],
    },
  ],
  exports: [RegisterUseCase, LoginUseCase, LogoutUseCase, RefreshTokenUseCase],
})
export class AuthModule {}
