import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  EMAIL_SERVICE,
  ENCRYPTION_SERVICE,
  HASH_SERVICE,
  TOKEN_SERVICE,
  TOTP_SERVICE,
} from '../../core/application/ports/tokens';
import { SendVerificationOtpUseCase } from '../../core/application/use-cases/auth/send-verification-otp.use-case';
import { VerifyOtpUseCase } from '../../core/application/use-cases/auth/verify-otp.use-case';
import { RegisterUseCase } from '../../core/application/use-cases/auth/register.use-case';
import { LoginUseCase } from '../../core/application/use-cases/auth/login.use-case';
import { LogoutUseCase } from '../../core/application/use-cases/auth/logout.use-case';
import { RefreshTokenUseCase } from '../../core/application/use-cases/auth/refresh-token.use-case';
import { VerifyTwoFactorUseCase } from '../../core/application/use-cases/auth/verify-two-factor.use-case';
import { ResendTwoFactorOtpUseCase } from '../../core/application/use-cases/auth/resend-two-factor-otp.use-case';
import { EnrollTotpUseCase } from '../../core/application/use-cases/auth/enroll-totp.use-case';
import { ConfirmTotpUseCase } from '../../core/application/use-cases/auth/confirm-totp.use-case';
import { DisableTotpUseCase } from '../../core/application/use-cases/auth/disable-totp.use-case';
import { AesEncryptionService } from '../../infrastructure/security/services/encryption.service';
import { OtplibTotpService } from '../../infrastructure/security/services/totp.service';
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
    VerifyTwoFactorUseCase,
    ResendTwoFactorOtpUseCase,
    EnrollTotpUseCase,
    ConfirmTotpUseCase,
    DisableTotpUseCase,
    { provide: ENCRYPTION_SERVICE, useClass: AesEncryptionService },
    { provide: TOTP_SERVICE, useClass: OtplibTotpService },
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
