import { DomainException } from './domain.exception';

export class InvalidTwoFactorCodeException extends DomainException {
  constructor() {
    super('Invalid or expired verification code');
  }
}
