import { DomainException } from './domain.exception';

export class TwoFactorChallengeInvalidException extends DomainException {
  constructor() {
    super('Two-factor challenge is invalid or has expired. Please log in again.');
  }
}
