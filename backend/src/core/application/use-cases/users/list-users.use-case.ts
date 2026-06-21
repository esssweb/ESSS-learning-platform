import { Inject, Injectable } from '@nestjs/common';
import { ListUsersRequestDto } from '../../dto/users/list-users-request.dto';
import { ListUsersResponseDto } from '../../dto/users/list-users-response.dto';
import { AuthRepositoryInterface } from '../../../domain/repositories/auth.repository.interface';
import { UserRepositoryInterface } from '../../../domain/repositories/user.repository.interface';
import { AUTH_REPOSITORY, USER_REPOSITORY } from '../../ports/tokens';
import { mapUserToResponseDto } from './user-response.mapper';

@Injectable()
export class ListUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepositoryInterface,
  ) {}

  async execute(dto: ListUsersRequestDto): Promise<ListUsersResponseDto> {
    const page = dto.page && dto.page > 0 ? dto.page : 1;
    const limit = dto.limit && dto.limit > 0 ? Math.min(dto.limit, 100) : 20;

    const result = await this.userRepository.findWithPagination({
      page,
      limit,
      role: dto.role,
    });

    const usersWithEmail = await Promise.all(
      result.data.map(async (user) => {
        const auth = await this.authRepository.findById(user.authId);
        return mapUserToResponseDto(user, auth?.email ?? '');
      }),
    );

    return {
      data: usersWithEmail,
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }
}
