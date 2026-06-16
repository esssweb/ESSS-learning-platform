import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DeviceToken } from '../../../../core/domain/models/auth/device-token.model';
import { DeviceTokenRepositoryInterface } from '../../../../core/domain/repositories/device-token.repository.interface';
import { DeviceTokenEntity } from '../../entities/device-token.entity';
import { DeviceTokenMapper } from '../../mappers/device-token.mapper';
import { BaseSequelizeRepository } from '../base/base.repository';

@Injectable()
export class DeviceTokenRepository
  extends BaseSequelizeRepository<DeviceToken, DeviceTokenEntity>
  implements DeviceTokenRepositoryInterface
{
  constructor(
    @InjectModel(DeviceTokenEntity)
    private readonly deviceTokenModel: typeof DeviceTokenEntity,
  ) {
    super(deviceTokenModel);
  }

  protected toDomain(entity: DeviceTokenEntity): DeviceToken {
    return DeviceTokenMapper.toDomain(entity);
  }

  async create(entity: DeviceToken): Promise<DeviceToken> {
    const payload = DeviceTokenMapper.toEntity(entity);
    const createdEntity = await this.deviceTokenModel.create(payload as Partial<DeviceTokenEntity>);
    return this.toDomain(createdEntity);
  }

  async update(id: string, entity: Partial<DeviceToken>): Promise<DeviceToken> {
    const existing = await this.deviceTokenModel.findByPk(id);
    if (!existing) {
      throw new Error(`Device token not found: ${id}`);
    }

    const payload =
      entity instanceof DeviceToken
        ? DeviceTokenMapper.toEntity(entity)
        : (entity as unknown as Partial<DeviceTokenEntity>);

    await existing.update(payload);
    return this.toDomain(existing);
  }

  async findByUserId(userId: string): Promise<DeviceToken[]> {
    const entities = await this.deviceTokenModel.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  async findByFirebaseToken(firebaseToken: string): Promise<DeviceToken | null> {
    const entity = await this.deviceTokenModel.findOne({
      where: { firebaseToken },
    });

    return entity ? this.toDomain(entity) : null;
  }

  async findActiveByUserId(userId: string): Promise<DeviceToken[]> {
    const entities = await this.deviceTokenModel.findAll({
      where: {
        userId,
        isActive: true,
      },
      order: [['createdAt', 'DESC']],
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  async deactivateByUserId(userId: string): Promise<void> {
    await this.deviceTokenModel.update(
      { isActive: false },
      {
        where: {
          userId,
          isActive: true,
        },
      },
    );
  }
}
