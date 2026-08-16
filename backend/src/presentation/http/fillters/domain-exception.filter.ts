import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainException } from '../../../core/domain/exceptions/domain.exception';
import { EmailNotVerifiedException } from '../../../core/domain/exceptions/email-not-verified.exception';
import { InvalidCredentialsException } from '../../../core/domain/exceptions/invalid-credentials.exception';
import { OtpRateLimitException } from '../../../core/domain/exceptions/otp-rate-limit.exception';
import { PhoneNumberAlreadyInUseException } from '../../../core/domain/exceptions/phone-number-already-in-use.exception';
import { UnauthorizedAccessException } from '../../../core/domain/exceptions/unauthorized-access.exception';
import { UserAlreadyExistsException } from '../../../core/domain/exceptions/user-already-exists.exception';
import { UserNotFoundException } from '../../../core/domain/exceptions/user-not-found.exception';

/**
 * Translates domain exceptions into HTTP responses.
 *
 * This catches the real `DomainException` from the domain layer. Mapping is by
 * exception type rather than by substring-matching the message, so renaming a
 * message can no longer silently change a status code. Anything not listed
 * falls through to 400.
 */
@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  private static readonly STATUS_BY_EXCEPTION = new Map<Function, HttpStatus>([
    [UserNotFoundException, HttpStatus.NOT_FOUND],
    [UserAlreadyExistsException, HttpStatus.CONFLICT],
    [PhoneNumberAlreadyInUseException, HttpStatus.CONFLICT],
    [InvalidCredentialsException, HttpStatus.UNAUTHORIZED],
    [UnauthorizedAccessException, HttpStatus.UNAUTHORIZED],
    [EmailNotVerifiedException, HttpStatus.FORBIDDEN],
    [OtpRateLimitException, HttpStatus.TOO_MANY_REQUESTS],
  ]);

  catch(exception: DomainException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      DomainExceptionFilter.STATUS_BY_EXCEPTION.get(exception.constructor) ??
      HttpStatus.BAD_REQUEST;

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(`${exception.name}: ${exception.message}`, exception.stack);
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      error: {
        // The class name is a stable machine-readable discriminator for clients.
        code: exception.name,
        message: exception.message,
      },
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
