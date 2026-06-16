import { Inject, Injectable } from '@nestjs/common';
import { AuthRepositoryInterface } from '../../../domain/repositories/auth.repository.interface';
import { HashServiceInterface } from '../../ports/output/hash.service.interface';
import { TokenServiceInterface } from '../../ports/output/token.service.interface';
import { VerifyOtpRequestDto } from '../../dto/auth/verify-otp-request.dto';
import { VerifyOtpResponseDto } from '../../dto/auth/verify-otp-response.dto';
import { Email } from '../../../domain/value-objects/email.vo';
import { OtpInvalidException } from '../../../domain/exceptions/otp-invalid.exception';
import { OtpExpiredException } from '../../../domain/exceptions/otp-expired.exception';
import { OtpMaxAttemptsException } from '../../../domain/exceptions/otp-max-attempts.exception';
import {
  AUTH_REPOSITORY,
  HASH_SERVICE,
  TOKEN_SERVICE,
} from '../../ports/tokens';

@Injectable()
export class VerifyOtpUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepositoryInterface,
    @Inject(HASH_SERVICE)
    private readonly hashService: HashServiceInterface,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenServiceInterface,
  ) {}

  async execute(dto: VerifyOtpRequestDto): Promise<VerifyOtpResponseDto> {
    const email = new Email(dto.email);
    const emailValue = email.getValue();

    const auth = await this.authRepository.findByEmail(emailValue);

    if (!auth || !auth.otpCode) {
      throw new OtpInvalidException();
    }

    if (auth.isOtpExpired()) {
      throw new OtpExpiredException();
    }

    if (!auth.canAttemptOtp()) {
      throw new OtpMaxAttemptsException();
    }

    // Increment attempts before comparing
    auth.incrementOtpAttempts();

    const isValid = await this.hashService.compare(dto.otpCode, auth.otpCode);

    if (!isValid) {
      await this.authRepository.update(auth.id!, auth);
      throw new OtpInvalidException();
    }

    // Generate verification token (30 min expiry)
    const verificationToken = this.tokenService.generateVerificationToken({
      email: emailValue,
    });

    // Mark email as verified and store token
    auth.markEmailVerified(verificationToken);
    await this.authRepository.update(auth.id!, auth);

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    return {
      verificationToken,
      expiresAt,
    };
  }
}
