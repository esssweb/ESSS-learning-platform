import { DomainException } from './domain.exception';

export class PhoneNumberAlreadyInUseException extends DomainException {
  constructor(phoneNumber: string) {
    super(`Phone number already in use: ${phoneNumber}`);
  }
}
