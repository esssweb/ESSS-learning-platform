import { Inject, Injectable } from '@nestjs/common';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception';
import { UserRepositoryInterface } from '../../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../ports/tokens';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  async execute(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    await this.userRepository.delete(userId);
  }
}
