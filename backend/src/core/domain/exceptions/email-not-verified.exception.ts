import { DomainException } from './domain.exception';

export class EmailNotVerifiedException extends DomainException {
  constructor() {
    super('Email has not been verified. Please verify your email first.');
  }
}
