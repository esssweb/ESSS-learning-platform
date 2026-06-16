import { BaseRepositoryInterface } from './base-repository.interface';
import { RefreshToken } from '../models/auth/refresh-token.model';

export interface RefreshTokenRepositoryInterface extends BaseRepositoryInterface<RefreshToken> {
  findByToken(token: string): Promise<RefreshToken | null>;
  findByUserId(userId: string): Promise<RefreshToken[]>;
  findActiveByUserId(userId: string): Promise<RefreshToken[]>;
  revokeByUserId(userId: string): Promise<void>;
  revokeByDeviceTokenId(deviceTokenId: string): Promise<void>;
  deleteExpired(): Promise<void>;
}
