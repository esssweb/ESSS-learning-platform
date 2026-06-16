import { BaseRepositoryInterface } from './base-repository.interface';
import { DeviceToken } from '../models/auth/device-token.model';

export interface DeviceTokenRepositoryInterface extends BaseRepositoryInterface<DeviceToken> {
  findByUserId(userId: string): Promise<DeviceToken[]>;
  findByFirebaseToken(firebaseToken: string): Promise<DeviceToken | null>;
  findActiveByUserId(userId: string): Promise<DeviceToken[]>;
  deactivateByUserId(userId: string): Promise<void>;
}
