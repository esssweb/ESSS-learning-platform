import { UserResponseDto } from '../../dto/users/user-response.dto';
import { User } from '../../../domain/models/user/user.model';

export function mapUserToResponseDto(user: User): UserResponseDto {
  return {
    id: user.id!,
    email: user.email.getValue(),
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber?.getValue(),
    profilePicture: user.profilePicture,
    gender: user.gender,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
