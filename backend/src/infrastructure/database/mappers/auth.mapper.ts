import { AuthEntity } from '../entities/auth.entity';
import { Auth } from '../../../core/domain/models/auth/auth.model';

export class AuthMapper {
  static toDomain(entity: AuthEntity): Auth {
    return new Auth({
      id: entity.id,
      email: entity.email,
      password: entity.password ?? undefined,
      emailVerified: entity.emailVerified,
      otpCode: entity.otpCode ?? undefined,
      otpExpiresAt: entity.otpExpiresAt ?? undefined,
      otpAttemptCount: entity.otpAttemptCount,
      otpRequestCount: entity.otpRequestCount,
      lastOtpSentAt: entity.lastOtpSentAt ?? undefined,
      verificationToken: entity.verificationToken ?? undefined,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toEntity(domain: Auth): Partial<AuthEntity> {
    return {
      id: domain.id,
      email: domain.email,
      password: domain.password ?? null,
      emailVerified: domain.emailVerified,
      otpCode: domain.otpCode ?? null,
      otpExpiresAt: domain.otpExpiresAt ?? null,
      otpAttemptCount: domain.otpAttemptCount,
      otpRequestCount: domain.otpRequestCount,
      lastOtpSentAt: domain.lastOtpSentAt ?? null,
      verificationToken: domain.verificationToken ?? null,
      isActive: domain.isActive,
    } as Partial<AuthEntity>;
  }
}
