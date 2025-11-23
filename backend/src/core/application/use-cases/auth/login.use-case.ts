import { Injectable } from '@nestjs/common';
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

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepositoryInterface,
    private readonly refreshTokenRepository: RefreshTokenRepositoryInterface,
    private readonly deviceTokenRepository: DeviceTokenRepositoryInterface,
    private readonly hashService: HashServiceInterface,
    private readonly tokenService: TokenServiceInterface,
  ) {}

  async execute(dto: LoginRequestDto): Promise<LoginResponseDto> {
    // Find user by email
    const email = new Email(dto.email);
    const user = await this.userRepository.findByEmail(email.getValue());

    if (!user) {
      throw new InvalidCredentialsException();
    }

    // Verify password
    const isPasswordValid = await this.hashService.compare(
      dto.password,
      user.password.getValue(),
    );

    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedAccessException('inactive account');
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
      email: user.email.getValue(),
      role: user.role,
    };

    const accessToken = this.tokenService.generateAccessToken(tokenPayload);
    const refreshTokenString = this.tokenService.generateRefreshToken(tokenPayload);

    // Save refresh token
    const refreshToken = new RefreshToken({
      userId: user.id!,
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
        id: user.id!,
        email: user.email.getValue(),
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }
}
