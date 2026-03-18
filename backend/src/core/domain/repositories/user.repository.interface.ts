import { BaseRepositoryInterface } from './base-repository.interface';
import { User } from '../models/user/user.model';
import { UserRole } from '../enums/user-role.enum';

export interface UserPaginationOptions {
  page: number;
  limit: number;
  role?: UserRole;
}

export interface UserPaginationResult {
  data: User[];
  total: number;
  page: number;
  limit: number;
}

export interface UserRepositoryInterface extends BaseRepositoryInterface<User> {
  findByEmail(email: string): Promise<User | null>;
  findByPhone(phoneNumber: string): Promise<User | null>;
  findByRole(role: UserRole): Promise<User[]>;
  findActiveUsers(): Promise<User[]>;
  existsByEmail(email: string): Promise<boolean>;
  existsByPhone(phoneNumber: string): Promise<boolean>;
  findWithPagination(options: UserPaginationOptions): Promise<UserPaginationResult>;
}
