import { BaseRepositoryInterface } from './base-repository.interface';
import { Auth } from '../models/auth/auth.model';

export interface AuthRepositoryInterface extends BaseRepositoryInterface<Auth> {
  findByEmail(email: string): Promise<Auth | null>;
  existsByEmail(email: string): Promise<boolean>;

  /**
   * Loads the auth record under an exclusive row lock, runs `work`, then persists the
   * (possibly mutated) aggregate — all in one transaction — so concurrent requests for
   * the same account are serialized. Returns null if no record exists.
   * `work` must RETURN expected outcomes rather than throw: a throw rolls the
   * transaction back, discarding changes such as a failed-attempt increment.
   */
  updateExclusively<T>(authId: string, work: (auth: Auth) => Promise<T>): Promise<T | null>;
}
