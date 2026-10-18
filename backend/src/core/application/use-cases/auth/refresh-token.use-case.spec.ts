import { RefreshTokenUseCase } from './refresh-token.use-case';
import { RefreshToken } from '../../../domain/models/auth/refresh-token.model';
import { Auth } from '../../../domain/models/auth/auth.model';
import { User } from '../../../domain/models/user/user.model';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { UnauthorizedAccessException } from '../../../domain/exceptions/unauthorized-access.exception';

const build = (tokenRole: UserRole, currentRole: UserRole) => {
  const stored = new RefreshToken({
    id: 'rt-1',
    userId: 'user-1',
    token: 'old-refresh',
    expiresAt: new Date(Date.now() + 86_400_000),
    isRevoked: false,
  });
  const refreshTokenRepository = {
    findByToken: jest.fn().mockResolvedValue(stored),
    update: jest.fn().mockResolvedValue(stored),
    create: jest.fn().mockImplementation(async (t: RefreshToken) => t),
  };
  const userRepository = {
    findById: jest.fn().mockResolvedValue(
      new User({
        id: 'user-1',
        authId: 'auth-1',
        firstName: 'A',
        lastName: 'B',
        role: currentRole,
      }),
    ),
  };
  const authRepository = {
    findById: jest.fn().mockResolvedValue(
      new Auth({
        id: 'auth-1',
        email: 'u@esss.local',
        emailVerified: true,
        otpAttemptCount: 0,
        otpRequestCount: 0,
        isActive: true,
        loginOtpAttemptCount: 0,
        loginOtpRequestCount: 0,
      }),
    ),
  };
  const tokenService = {
    verifyRefreshToken: jest
      .fn()
      .mockReturnValue({ userId: 'user-1', email: 'u@esss.local', role: tokenRole }),
    generateAccessToken: jest.fn().mockReturnValue('new-access'),
    generateRefreshToken: jest.fn().mockReturnValue('new-refresh'),
  };
  const useCase = new RefreshTokenUseCase(
    refreshTokenRepository as never,
    userRepository as never,
    authRepository as never,
    tokenService as never,
  );
  return { useCase, stored, refreshTokenRepository, tokenService };
};

describe('RefreshTokenUseCase role binding', () => {
  it('rotates normally when the token role matches the current role', async () => {
    const { useCase, refreshTokenRepository, tokenService } = build(
      UserRole.STUDENT,
      UserRole.STUDENT,
    );

    await expect(useCase.execute({ refreshToken: 'old-refresh' })).resolves.toEqual({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
    });
    expect(tokenService.generateAccessToken).toHaveBeenCalledWith(
      expect.objectContaining({ role: UserRole.STUDENT }),
    );
    expect(refreshTokenRepository.create).toHaveBeenCalledTimes(1);
  });

  it('rejects a STUDENT-born token once the user is ADMIN, minting and persisting nothing', async () => {
    const { useCase, stored, refreshTokenRepository, tokenService } = build(
      UserRole.STUDENT,
      UserRole.ADMIN,
    );

    await expect(useCase.execute({ refreshToken: 'old-refresh' })).rejects.toBeInstanceOf(
      UnauthorizedAccessException,
    );
    expect(tokenService.generateAccessToken).not.toHaveBeenCalled();
    expect(tokenService.generateRefreshToken).not.toHaveBeenCalled();
    expect(refreshTokenRepository.create).not.toHaveBeenCalled();
    expect(refreshTokenRepository.update).not.toHaveBeenCalled();
    expect(stored.isRevoked).toBe(false);
  });

  it('rejects an ADMIN-born token after demotion to STUDENT', async () => {
    const { useCase, refreshTokenRepository, tokenService } = build(
      UserRole.ADMIN,
      UserRole.STUDENT,
    );

    await expect(useCase.execute({ refreshToken: 'old-refresh' })).rejects.toBeInstanceOf(
      UnauthorizedAccessException,
    );
    expect(tokenService.generateAccessToken).not.toHaveBeenCalled();
    expect(refreshTokenRepository.create).not.toHaveBeenCalled();
  });
});
