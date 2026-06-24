import { UserRole } from '../decorators/roles.decorator';

export interface JwtPayload {
  sub?: string;
  userId?: string;
  email?: string;
  role?: UserRole;
  type?: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}
