import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from '../../ports/tokens';
import { UserRepositoryInterface } from '../../../domain/repositories/user.repository.interface';
import { UpdateUserRequestDto } from '../../dto/users/update-user-request.dto';
import { UserResponseDto } from '../../dto/users/user-response.dto';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception';
import { PhoneNumber } from '../../../domain/value-objects/phone-number.vo';
import { PhoneNumberAlreadyInUseException } from '../../../domain/exceptions/phone-number-already-in-use.exception';
import { mapUserToResponseDto } from './user-response.mapper';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  async execute(userId: string, dto: UpdateUserRequestDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    let normalizedPhoneNumber: PhoneNumber | undefined;
    if (dto.phoneNumber) {
      normalizedPhoneNumber = new PhoneNumber(dto.phoneNumber);
      const existingByPhone = await this.userRepository.findByPhone(
        normalizedPhoneNumber.getValue(),
      );
      if (existingByPhone && existingByPhone.id !== user.id) {
        throw new PhoneNumberAlreadyInUseException(normalizedPhoneNumber.getValue());
      }
    }

    user.updateProfile({
      firstName: dto.firstName,
      lastName: dto.lastName,
      phoneNumber: normalizedPhoneNumber,
      profilePicture: dto.profilePicture,
      gender: dto.gender,
    });

    const updatedUser = await this.userRepository.update(userId, user);
    return mapUserToResponseDto(updatedUser);
  }
}
