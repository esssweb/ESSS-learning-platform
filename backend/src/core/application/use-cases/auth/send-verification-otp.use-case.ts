import { Inject, Injectable } from '@nestjs/common';
import { randomInt } from 'crypto';
import { AuthRepositoryInterface } from '../../../domain/repositories/auth.repository.interface';
import { HashServiceInterface } from '../../ports/output/hash.service.interface';
import { EmailServiceInterface } from '../../ports/output/email.service.interface';
import { SendOtpRequestDto } from '../../dto/auth/send-otp-request.dto';
import { SendOtpResponseDto } from '../../dto/auth/send-otp-response.dto';
import { Email } from '../../../domain/value-objects/email.vo';
import { Auth } from '../../../domain/models/auth/auth.model';
import { UserAlreadyExistsException } from '../../../domain/exceptions/user-already-exists.exception';
import { OtpRateLimitException } from '../../../domain/exceptions/otp-rate-limit.exception';
import {
  AUTH_REPOSITORY,
  EMAIL_SERVICE,
  HASH_SERVICE,
} from '../../ports/tokens';

@Injectable()
export class SendVerificationOtpUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepositoryInterface,
    @Inject(HASH_SERVICE)
    private readonly hashService: HashServiceInterface,
    @Inject(EMAIL_SERVICE)
    private readonly emailService: EmailServiceInterface,
  ) {}

  async execute(dto: SendOtpRequestDto): Promise<SendOtpResponseDto> {
    const email = new Email(dto.email);
    const emailValue = email.getValue();

    // Check if auth record already exists
    let auth = await this.authRepository.findByEmail(emailValue);

    if (auth && auth.isFullyRegistered()) {
      throw new UserAlreadyExistsException(emailValue);
    }

    // Generate 6-digit OTP
    const otpCode = randomInt(100000, 1000000).toString();
    const hashedOtp = await this.hashService.hash(otpCode);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (auth) {
      // Existing incomplete registration — check rate limit
      if (!auth.canRequestNewOtp()) {
        throw new OtpRateLimitException();
      }
      auth.setOtp(hashedOtp, expiresAt);
      await this.authRepository.update(auth.id!, auth);
    } else {
      // Create new auth record
      auth = new Auth({
        email: emailValue,
        emailVerified: false,
        otpAttemptCount: 0,
        otpRequestCount: 0,
        isActive: true,
      });
      auth.setOtp(hashedOtp, expiresAt);
      await this.authRepository.create(auth);
    }

    // Send OTP via email
    await this.emailService.sendOtp(emailValue, otpCode);

    return {
      message: 'Verification code sent to your email.',
      expiresAt,
    };
  }
}
