import { Injectable } from '@nestjs/common';
import { RefreshTokenRepositoryInterface } from '../../../domain/repositories/refresh-token.repository.interface';
import { UserRepositoryInterface } from '../../../domain/repositories/user.repository.interface';
import { TokenServiceInterface } from '../../ports/output/token.service.interface';
import { RefreshTokenRequestDto } from '../../dto/auth/refresh-token-request.dto';
import { RefreshTokenResponseDto } from '../../dto/auth/refresh-token-response.dto';
import { RefreshToken } from '../../../domain/models/auth/refresh-token.model';
import { UnauthorizedAccessException } from '../../../domain/exceptions/unauthorized-access.exception';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepositoryInterface,
    private readonly userRepository: UserRepositoryInterface,
    private readonly tokenService: TokenServiceInterface,
  ) {}

  async execute(dto: RefreshTokenRequestDto): Promise<RefreshTokenResponseDto> {
    // Verify token signature
    let payload;
    try {
      payload = this.tokenService.verifyRefreshToken(dto.refreshToken);
    } catch (error) {
      throw new UnauthorizedAccessException('invalid refresh token');
    }

    // Find refresh token in database
    const refreshToken = await this.refreshTokenRepository.findByToken(dto.refreshToken);

    if (!refreshToken) {
      throw new UnauthorizedAccessException('refresh token not found');
    }

    // Validate refresh token
    if (!refreshToken.isValid()) {
      throw new UnauthorizedAccessException('refresh token expired or revoked');
    }

    // Get user
    const user = await this.userRepository.findById(payload.userId);

    if (!user || !user.isActive) {
      throw new UnauthorizedAccessException('user not found or inactive');
    }

    // Revoke old refresh token
    refreshToken.revoke();
    await this.refreshTokenRepository.update(refreshToken.id!, refreshToken);

    // Generate new tokens
    const tokenPayload = {
      userId: user.id!,
      email: user.email.getValue(),
      role: user.role,
    };

    const accessToken = this.tokenService.generateAccessToken(tokenPayload);
    const newRefreshTokenString = this.tokenService.generateRefreshToken(tokenPayload);

    // Save new refresh token
    const newRefreshToken = new RefreshToken({
      userId: user.id!,
      token: newRefreshTokenString,
      deviceTokenId: refreshToken.deviceTokenId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      isRevoked: false,
    });

    await this.refreshTokenRepository.create(newRefreshToken);

    return {
      accessToken,
      refreshToken: newRefreshTokenString,
    };
  }
}
