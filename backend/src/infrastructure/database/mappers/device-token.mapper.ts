import { DeviceTokenEntity } from '../entities/device-token.entity';
import { DeviceToken } from '../../../core/domain/models/auth/device-token.model';

export class DeviceTokenMapper {
  static toDomain(entity: DeviceTokenEntity): DeviceToken {
    return new DeviceToken({
      id: entity.id,
      userId: entity.userId,
      firebaseToken: entity.firebaseToken,
      deviceName: entity.deviceName,
      deviceType: entity.deviceType,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toEntity(domain: DeviceToken): Partial<DeviceTokenEntity> {
    return {
      id: domain.id,
      userId: domain.userId,
      firebaseToken: domain.firebaseToken,
      deviceName: domain.deviceName,
      deviceType: domain.deviceType,
      isActive: domain.isActive,
    };
  }
}
