import { RefreshTokenEntity } from '../entities/refresh-token.entity';
import { RefreshToken } from '../../../core/domain/models/auth/refresh-token.model';

export class RefreshTokenMapper {
  static toDomain(entity: RefreshTokenEntity): RefreshToken {
    return new RefreshToken({
      id: entity.id,
      userId: entity.userId,
      token: entity.token,
      deviceTokenId: entity.deviceTokenId,
      expiresAt: entity.expiresAt,
      isRevoked: entity.isRevoked,
      createdAt: entity.createdAt,
    });
  }

  static toEntity(domain: RefreshToken): Partial<RefreshTokenEntity> {
    return {
      id: domain.id,
      userId: domain.userId,
      token: domain.token,
      deviceTokenId: domain.deviceTokenId,
      expiresAt: domain.expiresAt,
      isRevoked: domain.isRevoked,
    };
  }
}
