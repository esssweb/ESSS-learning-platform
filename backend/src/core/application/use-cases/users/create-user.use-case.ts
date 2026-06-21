import { Inject, Injectable } from '@nestjs/common';
import { AUTH_REPOSITORY, HASH_SERVICE, USER_REPOSITORY } from '../../ports/tokens';
import { HashServiceInterface } from '../../ports/output/hash.service.interface';
import { AuthRepositoryInterface } from '../../../domain/repositories/auth.repository.interface';
import { UserRepositoryInterface } from '../../../domain/repositories/user.repository.interface';
import { CreateUserRequestDto } from '../../dto/users/create-user-request.dto';
import { UserResponseDto } from '../../dto/users/user-response.dto';
import { Email } from '../../../domain/value-objects/email.vo';
import { PhoneNumber } from '../../../domain/value-objects/phone-number.vo';
import { Auth } from '../../../domain/models/auth/auth.model';
import { User } from '../../../domain/models/user/user.model';
import { PhoneNumberAlreadyInUseException } from '../../../domain/exceptions/phone-number-already-in-use.exception';
import { UserAlreadyExistsException } from '../../../domain/exceptions/user-already-exists.exception';
import { mapUserToResponseDto } from './user-response.mapper';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepositoryInterface,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(HASH_SERVICE)
    private readonly hashService: HashServiceInterface,
  ) {}

  async execute(dto: CreateUserRequestDto): Promise<UserResponseDto> {
    const email = new Email(dto.email);
    const existingAuth = await this.authRepository.findByEmail(email.getValue());
    if (existingAuth && existingAuth.isFullyRegistered()) {
      throw new UserAlreadyExistsException(email.getValue());
    }

    let phoneNumber: PhoneNumber | undefined;
    if (dto.phoneNumber) {
      phoneNumber = new PhoneNumber(dto.phoneNumber);
      const existingByPhone = await this.userRepository.existsByPhone(phoneNumber.getValue());
      if (existingByPhone) {
        throw new PhoneNumberAlreadyInUseException(phoneNumber.getValue());
      }
    }

    const hashedPassword = await this.hashService.hash(dto.password);

    let auth: Auth;
    if (existingAuth) {
      existingAuth.setPassword(hashedPassword);
      auth = await this.authRepository.update(existingAuth.id!, existingAuth);
    } else {
      auth = await this.authRepository.create(
        new Auth({
          email: email.getValue(),
          password: hashedPassword,
          emailVerified: true,
          otpAttemptCount: 0,
          otpRequestCount: 0,
          isActive: true,
        }),
      );
    }

    const user = new User({
      authId: auth.id!,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phoneNumber,
      profilePicture: dto.profilePicture,
      gender: dto.gender,
      role: dto.role,
    });

    const createdUser = await this.userRepository.create(user);
    return mapUserToResponseDto(createdUser, auth.email);
  }
}
