import { Provider } from '@nestjs/common';
import {
  AUTH_REPOSITORY,
  DEVICE_TOKEN_REPOSITORY,
  REFRESH_TOKEN_REPOSITORY,
  USER_REPOSITORY,
} from '../../core/application/ports/tokens';
import { AuthRepository } from './repositories/auth/auth.repository';
import { DeviceTokenRepository } from './repositories/auth/device-token.repository';
import { RefreshTokenRepository } from './repositories/auth/refresh-token.repository';
import { UserRepository } from './repositories/user/user.repository';

export const databaseProviders: Provider[] = [
  {
    provide: AUTH_REPOSITORY,
    useClass: AuthRepository,
  },
  {
    provide: USER_REPOSITORY,
    useClass: UserRepository,
  },
  {
    provide: REFRESH_TOKEN_REPOSITORY,
    useClass: RefreshTokenRepository,
  },
  {
    provide: DEVICE_TOKEN_REPOSITORY,
    useClass: DeviceTokenRepository,
  },
];
