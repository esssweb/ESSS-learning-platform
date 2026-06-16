import { DomainException } from './domain.exception';

export class UnauthorizedAccessException extends DomainException {
  constructor(resource: string) {
    super(`Unauthorized access to ${resource}`);
  }
}
