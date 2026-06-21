import { UserEntity } from '../entities/user.entity';
import { User } from '../../../core/domain/models/user/user.model';
import { PhoneNumber } from '../../../core/domain/value-objects/phone-number.vo';
import { UserRole } from '../../../core/domain/enums/user-role.enum';
import { Gender } from '../../../core/domain/enums/gender.enum';

export class UserMapper {
  static toDomain(entity: UserEntity): User {
    return new User({
      id: entity.id,
      authId: entity.authId,
      firstName: entity.firstName,
      lastName: entity.lastName,
      phoneNumber: entity.phoneNumber ? new PhoneNumber(entity.phoneNumber) : undefined,
      profilePicture: entity.profilePicture,
      gender: entity.gender as Gender,
      role: entity.role as UserRole,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toEntity(domain: User): Partial<UserEntity> {
    return {
      id: domain.id,
      authId: domain.authId,
      firstName: domain.firstName,
      lastName: domain.lastName,
      phoneNumber: domain.phoneNumber?.getValue(),
      profilePicture: domain.profilePicture,
      gender: domain.gender,
      role: domain.role,
    } as Partial<UserEntity>;
  }
}
