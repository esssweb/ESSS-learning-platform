import { Inject, Injectable } from '@nestjs/common';
import { InvalidTwoFactorCodeException } from '../../../domain/exceptions/invalid-two-factor-code.exception';
import { TwoFactorNotEnrolledException } from '../../../domain/exceptions/two-factor-not-enrolled.exception';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception';
import { AuthRepositoryInterface } from '../../../domain/repositories/auth.repository.interface';
import { EncryptionServiceInterface } from '../../ports/output/encryption.service.interface';
import { TotpServiceInterface } from '../../ports/output/totp.service.interface';
import { AUTH_REPOSITORY, ENCRYPTION_SERVICE, TOTP_SERVICE } from '../../ports/tokens';

type ConfirmOutcome = { ok: true } | { ok: false; reason: 'not-enrolled' | 'code' };

@Injectable()
export class ConfirmTotpUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepository: AuthRepositoryInterface,
    @Inject(TOTP_SERVICE) private readonly totpService: TotpServiceInterface,
    @Inject(ENCRYPTION_SERVICE)
    private readonly encryptionService: EncryptionServiceInterface,
  ) {}

  async execute(authId: string, code: string): Promise<{ message: string }> {
    const outcome = await this.authRepository.updateExclusively<ConfirmOutcome>(
      authId,
      async (auth) => {
        // A stored secret alone is not enough: an already-enabled factor must not
        // be "re-confirmed" into a different state.
        if (!auth.isTotpEnrollmentPending()) {
          return { ok: false, reason: 'not-enrolled' };
        }

        // Uncapped on purpose: the enrolling user just scanned this secret, and the
        // account's login attempt budget is not theirs to spend here.
        const step = this.totpService.verify(
          this.encryptionService.decrypt(auth.totpSecret!),
          code,
        );
        if (step === null) {
          return { ok: false, reason: 'code' };
        }

        auth.confirmTotp();
        auth.consumeTotpStep(step);
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

    return { message: 'Authenticator app enabled.' };
  }
}
