import { Inject, Injectable } from '@nestjs/common';
import { UserResponseDto } from '../../dto/users/user-response.dto';
import { AUTH_REPOSITORY, USER_REPOSITORY } from '../../ports/tokens';
import { AuthRepositoryInterface } from '../../../domain/repositories/auth.repository.interface';
import { UserRepositoryInterface } from '../../../domain/repositories/user.repository.interface';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception';
import { mapUserToResponseDto } from './user-response.mapper';

@Injectable()
export class GetUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepositoryInterface,
  ) {}

  async execute(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    const auth = await this.authRepository.findById(user.authId);

    return mapUserToResponseDto(user, auth?.email ?? '');
  }
}
