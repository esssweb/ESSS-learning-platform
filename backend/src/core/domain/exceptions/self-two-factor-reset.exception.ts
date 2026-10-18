import { DomainException } from './domain.exception';

export class SelfTwoFactorResetException extends DomainException {
  constructor() {
    super(
      'You cannot reset your own two-factor authentication. Disable it with a current code instead.',
    );
  }
}
