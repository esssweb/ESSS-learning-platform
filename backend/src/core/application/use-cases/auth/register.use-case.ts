import { Inject, Injectable } from '@nestjs/common';
import { UserRepositoryInterface } from '../../../domain/repositories/user.repository.interface';
import { RefreshTokenRepositoryInterface } from '../../../domain/repositories/refresh-token.repository.interface';
import { DeviceTokenRepositoryInterface } from '../../../domain/repositories/device-token.repository.interface';
import { HashServiceInterface } from '../../ports/output/hash.service.interface';
import { TokenServiceInterface } from '../../ports/output/token.service.interface';
import { RegisterRequestDto } from '../../dto/auth/register-request.dto';
import { RegisterResponseDto } from '../../dto/auth/register-response.dto';
import { Email } from '../../../domain/value-objects/email.vo';
import { Password } from '../../../domain/value-objects/password.vo';
import { PhoneNumber } from '../../../domain/value-objects/phone-number.vo';
import { User } from '../../../domain/models/user/user.model';
import { RefreshToken } from '../../../domain/models/auth/refresh-token.model';
import { DeviceToken } from '../../../domain/models/auth/device-token.model';
import {
  DEVICE_TOKEN_REPOSITORY,
  HASH_SERVICE,
  REFRESH_TOKEN_REPOSITORY,
  TOKEN_SERVICE,
  USER_REPOSITORY,
} from '../../ports/tokens';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepositoryInterface,
    @Inject(DEVICE_TOKEN_REPOSITORY)
    private readonly deviceTokenRepository: DeviceTokenRepositoryInterface,
    @Inject(HASH_SERVICE)
    private readonly hashService: HashServiceInterface,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenServiceInterface,
  ) {}

  async execute(dto: RegisterRequestDto): Promise<RegisterResponseDto> {
    // Check if user already exists
    const email = new Email(dto.email);
    const userExists = await this.userRepository.existsByEmail(email.getValue());

    if (userExists) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await this.hashService.hash(dto.password);
    const password = new Password(hashedPassword, true);

    // Create user
    const user = new User({
      email,
      password,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phoneNumber: dto.phoneNumber ? new PhoneNumber(dto.phoneNumber) : undefined,
      gender: dto.gender,
      role: dto.role,
      isActive: true,
    });

    const createdUser = await this.userRepository.create(user);

    // Handle device token if provided
    let deviceTokenId: string | undefined;
    if (dto.deviceToken) {
      const deviceToken = new DeviceToken({
        userId: createdUser.id!,
        firebaseToken: dto.deviceToken,
        deviceName: dto.deviceName,
        deviceType: dto.deviceType,
        isActive: true,
      });
      const savedDeviceToken = await this.deviceTokenRepository.create(deviceToken);
      deviceTokenId = savedDeviceToken.id;
    }

    // Generate tokens
    const tokenPayload = {
      userId: createdUser.id!,
      email: createdUser.email.getValue(),
      role: createdUser.role,
    };

    const accessToken = this.tokenService.generateAccessToken(tokenPayload);
    const refreshTokenString = this.tokenService.generateRefreshToken(tokenPayload);

    // Save refresh token
    const refreshToken = new RefreshToken({
      userId: createdUser.id!,
      token: refreshTokenString,
      deviceTokenId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      isRevoked: false,
    });

    await this.refreshTokenRepository.create(refreshToken);

    // Return response
    return {
      accessToken,
      refreshToken: refreshTokenString,
      user: {
        id: createdUser.id!,
        email: createdUser.email.getValue(),
        firstName: createdUser.firstName,
        lastName: createdUser.lastName,
        role: createdUser.role,
      },
    };
  }
}
