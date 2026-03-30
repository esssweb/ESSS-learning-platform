import { Inject, Injectable } from '@nestjs/common';
import { AuthRepositoryInterface } from '../../../domain/repositories/auth.repository.interface';
import { UserRepositoryInterface } from '../../../domain/repositories/user.repository.interface';
import { RefreshTokenRepositoryInterface } from '../../../domain/repositories/refresh-token.repository.interface';
import { DeviceTokenRepositoryInterface } from '../../../domain/repositories/device-token.repository.interface';
import { HashServiceInterface } from '../../ports/output/hash.service.interface';
import { TokenServiceInterface } from '../../ports/output/token.service.interface';
import { LoginRequestDto } from '../../dto/auth/login-request.dto';
import { LoginResponseDto } from '../../dto/auth/login-response.dto';
import { Email } from '../../../domain/value-objects/email.vo';
import { InvalidCredentialsException } from '../../../domain/exceptions/invalid-credentials.exception';
import { UnauthorizedAccessException } from '../../../domain/exceptions/unauthorized-access.exception';
import { RefreshToken } from '../../../domain/models/auth/refresh-token.model';
import { DeviceToken } from '../../../domain/models/auth/device-token.model';
import {
  AUTH_REPOSITORY,
  DEVICE_TOKEN_REPOSITORY,
  HASH_SERVICE,
  REFRESH_TOKEN_REPOSITORY,
  TOKEN_SERVICE,
  USER_REPOSITORY,
} from '../../ports/tokens';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepositoryInterface,
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

  async execute(dto: LoginRequestDto): Promise<LoginResponseDto> {
    const email = new Email(dto.email);

    // Find auth record by email
    const auth = await this.authRepository.findByEmail(email.getValue());

    if (!auth || !auth.password) {
      throw new InvalidCredentialsException();
    }

    // Verify password
    const isPasswordValid = await this.hashService.compare(dto.password, auth.password);

    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    // Check if account is active
    if (!auth.isActive) {
      throw new UnauthorizedAccessException('inactive account');
    }

    // Find user record by authId
    const user = await this.userRepository.findByAuthId(auth.id!);

    if (!user) {
      throw new InvalidCredentialsException();
    }

    // Handle device token if provided
    let deviceTokenId: string | undefined;
    if (dto.deviceToken) {
      const deviceToken = new DeviceToken({
        userId: user.id!,
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
      userId: user.id!,
      email: auth.email,
      role: user.role,
    };

    const accessToken = this.tokenService.generateAccessToken(tokenPayload);
    const refreshTokenString = this.tokenService.generateRefreshToken(tokenPayload);

    // Save refresh token
    const refreshToken = new RefreshToken({
      userId: user.id!,
      token: refreshTokenString,
      deviceTokenId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isRevoked: false,
    });

    await this.refreshTokenRepository.create(refreshToken);

    return {
      accessToken,
      refreshToken: refreshTokenString,
      user: {
        id: user.id!,
        email: auth.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }
}
