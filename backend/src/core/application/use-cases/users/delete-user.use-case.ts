import { Inject, Injectable } from '@nestjs/common';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception';
import { AuthRepositoryInterface } from '../../../domain/repositories/auth.repository.interface';
import { UserRepositoryInterface } from '../../../domain/repositories/user.repository.interface';
import { AUTH_REPOSITORY, USER_REPOSITORY } from '../../ports/tokens';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepositoryInterface,
  ) {}

  // Full account delete. The auth row is the parent: users.auth_id references
  // it ON DELETE CASCADE, and device_tokens / refresh_tokens cascade from users.
  // Deleting only the users row would orphan the auth row, whose password makes
  // isFullyRegistered() true and blocks the email from ever registering again.
  // Deleting the parent removes the whole account in one atomic statement.
  async execute(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    await this.authRepository.delete(user.authId);
  }
}
