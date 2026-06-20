import { Inject, Injectable } from '@nestjs/common';
import { AssignRoleRequestDto } from '../../dto/users/assign-role-request.dto';
import { UserResponseDto } from '../../dto/users/user-response.dto';
import { User } from '../../../domain/models/user/user.model';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception';
import { UserRepositoryInterface } from '../../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../ports/tokens';
import { mapUserToResponseDto } from './user-response.mapper';

@Injectable()
export class AssignRoleUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  async execute(userId: string, dto: AssignRoleRequestDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    const reassignedUser = new User({
      id: user.id,
      email: user.email,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      profilePicture: user.profilePicture,
      gender: user.gender,
      role: dto.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: new Date(),
    });

    const updatedUser = await this.userRepository.update(userId, reassignedUser);
    return mapUserToResponseDto(updatedUser);
  }
}
