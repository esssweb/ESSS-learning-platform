import { DomainException } from './domain.exception';

export class OtpExpiredException extends DomainException {
  constructor() {
    super('Verification code has expired. Please request a new one.');
  }
}
