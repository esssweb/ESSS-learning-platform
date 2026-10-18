import { DomainException } from './domain.exception';

export class TwoFactorNotEnrolledException extends DomainException {
  constructor() {
    super('No pending authenticator enrollment for this account');
  }
}
