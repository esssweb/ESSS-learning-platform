import { Injectable } from '@nestjs/common';
import { RefreshTokenRepositoryInterface } from '../../../domain/repositories/refresh-token.repository.interface';

@Injectable()
export class LogoutUseCase {
  constructor(private readonly refreshTokenRepository: RefreshTokenRepositoryInterface) {}

  async execute(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      // Revoke specific refresh token
      const token = await this.refreshTokenRepository.findByToken(refreshToken);
      if (token) {
        token.revoke();
        await this.refreshTokenRepository.update(token.id!, token);
      }
    } else {
      // Revoke all refresh tokens for user
      await this.refreshTokenRepository.revokeByUserId(userId);
    }
  }
}
