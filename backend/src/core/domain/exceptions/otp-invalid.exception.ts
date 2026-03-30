import { DomainException } from './domain.exception';

export class OtpInvalidException extends DomainException {
  constructor() {
    super('Invalid verification code.');
  }
}
