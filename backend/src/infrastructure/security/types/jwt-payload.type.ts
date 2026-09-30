import { UserRole } from '../../../core/domain/enums/user-role.enum';

export interface JwtPayload {
  sub?: string;
  userId?: string;
  email?: string;
  role?: UserRole;
  type?: 'access' | 'refresh';
  purpose?: string;
  iat?: number;
  exp?: number;
}
