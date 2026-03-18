import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { RefreshToken } from '../../../../core/domain/models/auth/refresh-token.model';
import { RefreshTokenRepositoryInterface } from '../../../../core/domain/repositories/refresh-token.repository.interface';
import { RefreshTokenEntity } from '../../entities/refresh-token.entity';
import { RefreshTokenMapper } from '../../mappers/refresh-token.mapper';
import { BaseSequelizeRepository } from '../base/base.repository';

@Injectable()
export class RefreshTokenRepository
  extends BaseSequelizeRepository<RefreshToken, RefreshTokenEntity>
  implements RefreshTokenRepositoryInterface
{
  constructor(
    @InjectModel(RefreshTokenEntity)
    private readonly refreshTokenModel: typeof RefreshTokenEntity,
  ) {
    super(refreshTokenModel);
  }

  protected toDomain(entity: RefreshTokenEntity): RefreshToken {
    return RefreshTokenMapper.toDomain(entity);
  }

  async create(entity: RefreshToken): Promise<RefreshToken> {
    const payload = RefreshTokenMapper.toEntity(entity);
    const createdEntity = await this.refreshTokenModel.create(
      payload as Partial<RefreshTokenEntity>,
    );
    return this.toDomain(createdEntity);
  }

  async update(id: string, entity: Partial<RefreshToken>): Promise<RefreshToken> {
    const existing = await this.refreshTokenModel.findByPk(id);
    if (!existing) {
      throw new Error(`Refresh token not found: ${id}`);
    }

    const payload =
      entity instanceof RefreshToken
        ? RefreshTokenMapper.toEntity(entity)
        : (entity as unknown as Partial<RefreshTokenEntity>);

    await existing.update(payload);
    return this.toDomain(existing);
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const entity = await this.refreshTokenModel.findOne({
      where: { token },
    });

    return entity ? this.toDomain(entity) : null;
  }

  async findByUserId(userId: string): Promise<RefreshToken[]> {
    const entities = await this.refreshTokenModel.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  async findActiveByUserId(userId: string): Promise<RefreshToken[]> {
    const entities = await this.refreshTokenModel.findAll({
      where: {
        userId,
        isRevoked: false,
        expiresAt: { [Op.gt]: new Date() },
      },
      order: [['createdAt', 'DESC']],
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  async revokeByUserId(userId: string): Promise<void> {
    await this.refreshTokenModel.update(
      { isRevoked: true },
      {
        where: {
          userId,
          isRevoked: false,
        },
      },
    );
  }

  async revokeByDeviceTokenId(deviceTokenId: string): Promise<void> {
    await this.refreshTokenModel.update(
      { isRevoked: true },
      {
        where: {
          deviceTokenId,
          isRevoked: false,
        },
      },
    );
  }

  async deleteExpired(): Promise<void> {
    await this.refreshTokenModel.destroy({
      where: {
        expiresAt: { [Op.lt]: new Date() },
      },
    });
  }
}
