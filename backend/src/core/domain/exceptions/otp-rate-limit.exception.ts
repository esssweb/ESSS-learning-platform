import { DomainException } from './domain.exception';

export class OtpRateLimitException extends DomainException {
  constructor() {
    super('Too many verification requests. Please try again later.');
  }
}
