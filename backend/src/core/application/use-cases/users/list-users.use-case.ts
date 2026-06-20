import { Inject, Injectable } from '@nestjs/common';
import { ListUsersRequestDto } from '../../dto/users/list-users-request.dto';
import { ListUsersResponseDto } from '../../dto/users/list-users-response.dto';
import { UserRepositoryInterface } from '../../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../ports/tokens';
import { mapUserToResponseDto } from './user-response.mapper';

@Injectable()
export class ListUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  async execute(dto: ListUsersRequestDto): Promise<ListUsersResponseDto> {
    const page = dto.page && dto.page > 0 ? dto.page : 1;
    const limit = dto.limit && dto.limit > 0 ? Math.min(dto.limit, 100) : 20;

    const result = await this.userRepository.findWithPagination({
      page,
      limit,
      role: dto.role,
    });

    return {
      data: result.data.map((user) => mapUserToResponseDto(user)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }
}
