import { DomainException } from './domain.exception';

export class UserAlreadyExistsException extends DomainException {
  constructor(email: string) {
    super(`User already exists with email: ${email}`);
  }
}
