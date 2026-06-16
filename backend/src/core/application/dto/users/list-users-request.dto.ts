import { UserRole } from '../../../domain/enums/user-role.enum';

export class ListUsersRequestDto {
  page?: number;
  limit?: number;
  role?: UserRole;
}
