import { BaseRepositoryInterface } from './base-repository.interface';
import { User } from '../models/user/user.model';
import { UserRole } from '../enums/user-role.enum';

export interface UserRepositoryInterface extends BaseRepositoryInterface<User> {
  findByEmail(email: string): Promise<User | null>;
  findByRole(role: UserRole): Promise<User[]>;
  findActiveUsers(): Promise<User[]>;
  existsByEmail(email: string): Promise<boolean>;
}
