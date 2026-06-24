import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Example base domain exception
 * Replace with your actual domain base error
 */
export class DomainException extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
  }
}

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = this.mapExceptionToStatus(exception);

    response.status(status).json({
      success: false,
      statusCode: status,
      error: {
        code: exception.code,
        message: exception.message,
      },
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private mapExceptionToStatus(exception: DomainException): HttpStatus {
    switch (exception.code) {
      case 'USER_NOT_FOUND':
        return HttpStatus.NOT_FOUND;

      case 'INVALID_CREDENTIALS':
        return HttpStatus.UNAUTHORIZED;

      case 'EMAIL_ALREADY_EXISTS':
        return HttpStatus.CONFLICT;

      default:
        return HttpStatus.BAD_REQUEST;
    }
  }
}
