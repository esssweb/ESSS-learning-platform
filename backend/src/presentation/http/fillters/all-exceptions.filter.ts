import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Last-resort handler for anything the specific filters did not claim.
 *
 * Must be registered FIRST in app.module: Nest consults global filters in
 * reverse registration order, so registering this last would shadow every
 * other filter and collapse all errors to 500.
 *
 * It still honours HttpException status codes defensively — if filter ordering
 * ever regresses, callers get a correct status instead of a blanket 500.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    // Only genuinely unexpected failures are worth an error-level log; a 401 or
    // a 404 is normal traffic and would otherwise flood the logs.
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(exception);
    }

    let message: unknown = 'Internal server error';
    if (isHttpException) {
      const body = exception.getResponse();
      message = typeof body === 'string' ? body : ((body as Record<string, unknown>).message ?? body);
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
