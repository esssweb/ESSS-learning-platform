import { Inject, Injectable } from '@nestjs/common';
import { TwoFactorMethod } from '../../../domain/enums/two-factor-method.enum';
import { TwoFactorAlreadyEnabledException } from '../../../domain/exceptions/two-factor-already-enabled.exception';
import { InvalidCredentialsException } from '../../../domain/exceptions/invalid-credentials.exception';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception';
import { AuthRepositoryInterface } from '../../../domain/repositories/auth.repository.interface';
import { HashServiceInterface } from '../../ports/output/hash.service.interface';
import { EncryptionServiceInterface } from '../../ports/output/encryption.service.interface';
import { TotpServiceInterface } from '../../ports/output/totp.service.interface';
import {
  AUTH_REPOSITORY,
  ENCRYPTION_SERVICE,
  HASH_SERVICE,
  TOTP_SERVICE,
} from '../../ports/tokens';

type EnrollOutcome =
  | { ok: true; email: string }
  | { ok: false; reason: 'already-enabled' | 'bad-password' };

@Injectable()
export class EnrollTotpUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepository: AuthRepositoryInterface,
    @Inject(TOTP_SERVICE) private readonly totpService: TotpServiceInterface,
    @Inject(ENCRYPTION_SERVICE)
    private readonly encryptionService: EncryptionServiceInterface,
    @Inject(HASH_SERVICE) private readonly hashService: HashServiceInterface,
  ) {}

  async execute(authId: string, password: string): Promise<{ otpauthUri: string; secret: string }> {
    // Generated outside the lock: it does not depend on the stored state.
    const secret = this.totpService.generateSecret();
    const encrypted = this.encryptionService.encrypt(secret);

    const outcome = await this.authRepository.updateExclusively<EnrollOutcome>(
      authId,
      async (auth) => {
        // Step-up: a stolen access token alone must not be enough to bind an
        // attacker's authenticator to an admin account.
        if (!auth.password || !(await this.hashService.compare(password, auth.password))) {
          return { ok: false, reason: 'bad-password' };
        }
        // Replacing an active authenticator without a valid current code would let
        // a hijacked session swap the victim's second factor for the attacker's.
        if (auth.activeTwoFactorMethod() === TwoFactorMethod.TOTP) {
          return { ok: false, reason: 'already-enabled' };
        }
        // Stored but NOT activated. A mis-scanned QR must not lock the admin out,
        // so email OTP keeps governing login until confirmTotp succeeds.
        auth.enrollTotp(encrypted);
        return { ok: true, email: auth.email };
      },
    );

    if (outcome === null) {
      throw new UserNotFoundException(authId);
    }
    if (!outcome.ok) {
      if (outcome.reason === 'bad-password') {
        throw new InvalidCredentialsException();
      }
      throw new TwoFactorAlreadyEnabledException();
    }

    return {
      otpauthUri: this.totpService.buildOtpauthUri(secret, outcome.email),
      secret,
    };
  }
}
