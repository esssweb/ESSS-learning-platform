import { UserEntity } from '../entities/user.entity';
import { User } from '../../../core/domain/models/user/user.model';
import { Student } from '../../../core/domain/models/user/student.model';
import { Instructor } from '../../../core/domain/models/user/instructor.model';
import { Admin } from '../../../core/domain/models/user/admin.model';
import { SuperAdmin } from '../../../core/domain/models/user/super-admin.model';
import { Email } from '../../../core/domain/value-objects/email.vo';
import { Password } from '../../../core/domain/value-objects/password.vo';
import { PhoneNumber } from '../../../core/domain/value-objects/phone-number.vo';
import { UserRole } from '../../../core/domain/enums/user-role.enum';
import { Gender } from '../../../core/domain/enums/gender.enum';
import { StudentLevel } from '../../../core/domain/enums/student-level.enum';

export class UserMapper {
  static toDomain(entity: UserEntity): User | Student | Instructor | Admin | SuperAdmin {
    const baseProps = {
      id: entity.id,
      email: new Email(entity.email),
      password: new Password(entity.password, true), // Already hashed
      firstName: entity.firstName,
      lastName: entity.lastName,
      phoneNumber: entity.phoneNumber ? new PhoneNumber(entity.phoneNumber) : undefined,
      profilePicture: entity.profilePicture,
      gender: entity.gender as Gender,
      role: entity.role as UserRole,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };

    switch (entity.role) {
      case UserRole.STUDENT:
        return new Student({
          ...baseProps,
          level: entity.level as StudentLevel,
          enrollmentDate: entity.enrollmentDate || new Date(),
        });

      case UserRole.INSTRUCTOR:
        return new Instructor({
          ...baseProps,
          bio: entity.bio,
          expertise: entity.expertise || [],
          hireDate: entity.hireDate || new Date(),
        });

      case UserRole.ADMIN:
        return new Admin({
          ...baseProps,
          department: entity.department,
          hireDate: entity.hireDate || new Date(),
        });

      case UserRole.SUPER_ADMIN:
        return new SuperAdmin({
          ...baseProps,
          permissions: entity.permissions || [],
          hireDate: entity.hireDate || new Date(),
        });

      default:
        return new User(baseProps);
    }
  }

  static toEntity(domain: User): Partial<UserEntity> {
    const entity: Partial<UserEntity> = {
      id: domain.id,
      email: domain.email.getValue(),
      password: domain.password.getValue(),
      firstName: domain.firstName,
      lastName: domain.lastName,
      phoneNumber: domain.phoneNumber?.getValue(),
      profilePicture: domain.profilePicture,
      gender: domain.gender,
      role: domain.role,
      isActive: domain.isActive,
    };

    // Add role-specific fields
    if (domain instanceof Student) {
      entity.level = domain.level;
      entity.enrollmentDate = domain.enrollmentDate;
    } else if (domain instanceof Instructor) {
      entity.bio = domain.bio;
      entity.expertise = domain.expertise;
      entity.hireDate = domain.hireDate;
    } else if (domain instanceof Admin) {
      entity.department = domain.department;
      entity.hireDate = domain.hireDate;
    } else if (domain instanceof SuperAdmin) {
      entity.permissions = domain.permissions;
      entity.hireDate = domain.hireDate;
    }

    return entity;
  }
}
