import { Inject, Injectable } from '@nestjs/common';
import { SelfTwoFactorResetException } from '../../../domain/exceptions/self-two-factor-reset.exception';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception';
import { AuthRepositoryInterface } from '../../../domain/repositories/auth.repository.interface';
import { UserRepositoryInterface } from '../../../domain/repositories/user.repository.interface';
import { AUTH_REPOSITORY, USER_REPOSITORY } from '../../ports/tokens';

/**
 * Clears a user's authenticator enrollment, returning them to email codes.
 * The only recovery path for a lost TOTP device, so it is restricted to
 * SUPER_ADMIN at the controller. At least two SUPER_ADMIN accounts must exist,
 * or a single locked-out one cannot be recovered.
 */
@Injectable()
export class ResetTwoFactorUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepositoryInterface,
    @Inject(AUTH_REPOSITORY) private readonly authRepository: AuthRepositoryInterface,
  ) {}

  async execute(userId: string, actorUserId: string): Promise<{ message: string }> {
    // A self-reset would sidestep the current-code requirement for disabling TOTP.
    if (userId === actorUserId) {
      throw new SelfTwoFactorResetException();
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    // Mutated under the row lock so a concurrent login/verify cannot overwrite the reset.
    const done = await this.authRepository.updateExclusively(user.authId, async (auth) => {
      auth.disableTotp();
      auth.clearLoginOtp();
      return true;
    });
    if (done === null) {
      throw new UserNotFoundException(userId);
    }

    return { message: 'Two-factor authentication reset. Email codes will be used.' };
  }
}
