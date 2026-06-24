import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
