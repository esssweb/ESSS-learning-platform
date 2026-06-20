import { DomainException } from './domain.exception';

export class OtpMaxAttemptsException extends DomainException {
  constructor() {
    super('Maximum verification attempts exceeded. Please request a new code.');
  }
}
