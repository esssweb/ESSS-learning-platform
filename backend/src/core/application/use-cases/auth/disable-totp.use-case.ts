import { Inject, Injectable } from '@nestjs/common';
import { TwoFactorMethod } from '../../../domain/enums/two-factor-method.enum';
import { InvalidTwoFactorCodeException } from '../../../domain/exceptions/invalid-two-factor-code.exception';
import { TwoFactorNotEnrolledException } from '../../../domain/exceptions/two-factor-not-enrolled.exception';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception';
import { AuthRepositoryInterface } from '../../../domain/repositories/auth.repository.interface';
import { EncryptionServiceInterface } from '../../ports/output/encryption.service.interface';
import { TotpServiceInterface } from '../../ports/output/totp.service.interface';
import { AUTH_REPOSITORY, ENCRYPTION_SERVICE, TOTP_SERVICE } from '../../ports/tokens';

type DisableOutcome = { ok: true } | { ok: false; reason: 'not-enrolled' | 'code' };

@Injectable()
export class DisableTotpUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepository: AuthRepositoryInterface,
    @Inject(TOTP_SERVICE) private readonly totpService: TotpServiceInterface,
    @Inject(ENCRYPTION_SERVICE)
    private readonly encryptionService: EncryptionServiceInterface,
  ) {}

  // Requires a valid current code so a hijacked session cannot silently downgrade
  // the factor. Guesses share the login attempt budget, counted under the row lock;
  // `work` returns outcomes because a throw would roll back the increment.
  async execute(authId: string, code: string): Promise<{ message: string }> {
    const outcome = await this.authRepository.updateExclusively<DisableOutcome>(
      authId,
      async (auth) => {
        if (auth.activeTwoFactorMethod() !== TwoFactorMethod.TOTP) {
          return { ok: false, reason: 'not-enrolled' };
        }
        if (!auth.canAttemptTotp()) {
          return { ok: false, reason: 'code' };
        }

        const step = this.totpService.verify(
          this.encryptionService.decrypt(auth.totpSecret!),
          code,
        );
        if (step === null || auth.hasTotpStepBeenUsed(step)) {
          auth.incrementLoginOtpAttempts();
          return { ok: false, reason: 'code' };
        }

        auth.disableTotp();
        auth.clearLoginOtp();
        return { ok: true };
      },
    );

    if (outcome === null) {
      throw new UserNotFoundException(authId);
    }
    if (!outcome.ok) {
      if (outcome.reason === 'not-enrolled') {
        throw new TwoFactorNotEnrolledException();
      }
      throw new InvalidTwoFactorCodeException();
    }

    return { message: 'Authenticator app disabled. Email codes will be used instead.' };
  }
}
