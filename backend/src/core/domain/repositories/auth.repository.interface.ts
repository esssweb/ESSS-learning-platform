import { BaseRepositoryInterface } from './base-repository.interface';
import { Auth } from '../models/auth/auth.model';

export interface AuthRepositoryInterface extends BaseRepositoryInterface<Auth> {
  findByEmail(email: string): Promise<Auth | null>;
  existsByEmail(email: string): Promise<boolean>;
}
