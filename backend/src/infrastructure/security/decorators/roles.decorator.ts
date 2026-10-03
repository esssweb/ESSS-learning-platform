import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../../core/domain/enums/user-role.enum';

export const ROLES_KEY = 'roles';

/**
 * Restrict a route to the given roles. The values must come from the domain
 * UserRole enum, because that is what the login use case puts in the JWT
 * `role` claim and what RolesGuard compares against.
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

export { UserRole };
