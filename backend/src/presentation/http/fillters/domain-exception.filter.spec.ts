import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { DomainExceptionFilter } from './domain-exception.filter';
import { InvalidTwoFactorCodeException } from '../../../core/domain/exceptions/invalid-two-factor-code.exception';
import { SelfTwoFactorResetException } from '../../../core/domain/exceptions/self-two-factor-reset.exception';
import { TwoFactorAlreadyEnabledException } from '../../../core/domain/exceptions/two-factor-already-enabled.exception';
import { TwoFactorChallengeInvalidException } from '../../../core/domain/exceptions/two-factor-challenge-invalid.exception';
import { TwoFactorNotEnrolledException } from '../../../core/domain/exceptions/two-factor-not-enrolled.exception';
import { UserNotFoundException } from '../../../core/domain/exceptions/user-not-found.exception';

describe('DomainExceptionFilter', () => {
  let filter: DomainExceptionFilter;
  let mockResponse: { status: jest.Mock; json: jest.Mock };
  let mockRequest: { url: string };
  let mockArgumentsHost: ArgumentsHost;

  beforeEach(() => {
    filter = new DomainExceptionFilter();

    // Mock response with chainable status and json methods
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock request with url
    mockRequest = {
      url: '/test-url',
    };

    // Mock ArgumentsHost
    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse),
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as unknown as ArgumentsHost;
  });

  it('maps InvalidTwoFactorCodeException to 401 UNAUTHORIZED', () => {
    const exception = new InvalidTwoFactorCodeException();

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'InvalidTwoFactorCodeException',
        }),
      }),
    );
  });

  it('maps TwoFactorChallengeInvalidException to 401 UNAUTHORIZED', () => {
    const exception = new TwoFactorChallengeInvalidException();

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'TwoFactorChallengeInvalidException',
        }),
      }),
    );
  });

  it('maps TwoFactorNotEnrolledException to 400 BAD_REQUEST', () => {
    const exception = new TwoFactorNotEnrolledException();

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'TwoFactorNotEnrolledException',
        }),
      }),
    );
  });

  it('maps TwoFactorAlreadyEnabledException to 409 CONFLICT', () => {
    const exception = new TwoFactorAlreadyEnabledException();

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'TwoFactorAlreadyEnabledException',
        }),
      }),
    );
  });

  it('maps SelfTwoFactorResetException to 403 FORBIDDEN', () => {
    filter.catch(new SelfTwoFactorResetException(), mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'SelfTwoFactorResetException' }),
      }),
    );
  });

  it('maps UserNotFoundException to 404 NOT_FOUND (pre-existing mapping)', () => {
    const exception = new UserNotFoundException('test-user-id');

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'UserNotFoundException',
        }),
      }),
    );
  });
});
