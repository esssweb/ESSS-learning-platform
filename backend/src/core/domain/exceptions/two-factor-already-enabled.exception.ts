import { DomainException } from './domain.exception';

export class TwoFactorAlreadyEnabledException extends DomainException {
  constructor() {
    super('An authenticator app is already enabled. Disable it before enrolling a new one.');
  }
}
