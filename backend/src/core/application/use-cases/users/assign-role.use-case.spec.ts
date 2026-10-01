import { AssignRoleUseCase } from './assign-role.use-case';
import { User } from '../../../domain/models/user/user.model';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception';

describe('AssignRoleUseCase', () => {
  const user = (role: UserRole) =>
    new User({ id: 'user-1', authId: 'auth-1', firstName: 'A', lastName: 'B', role });

  const build = (found: User | null) => {
    const userRepository = {
      findById: jest.fn().mockResolvedValue(found),
      update: jest.fn(async (_id: string, u: User) => u),
    };
    const authRepository = { findById: jest.fn().mockResolvedValue({ email: 'a@b.c' }) };
    const refreshTokenRepository = { revokeByUserId: jest.fn().mockResolvedValue(undefined) };
    const useCase = new AssignRoleUseCase(
      userRepository as never,
      authRepository as never,
      refreshTokenRepository as never,
    );
    return { useCase, userRepository, refreshTokenRepository };
  };

  it('revokes all refresh tokens on STUDENT -> ADMIN', async () => {
    const { useCase, refreshTokenRepository } = build(user(UserRole.STUDENT));
    const result = await useCase.execute('user-1', { role: UserRole.ADMIN });
    expect(refreshTokenRepository.revokeByUserId).toHaveBeenCalledWith('user-1');
    expect(result.role).toBe(UserRole.ADMIN);
  });

  it('revokes all refresh tokens on ADMIN -> STUDENT', async () => {
    const { useCase, refreshTokenRepository } = build(user(UserRole.ADMIN));
    await useCase.execute('user-1', { role: UserRole.STUDENT });
    expect(refreshTokenRepository.revokeByUserId).toHaveBeenCalledWith('user-1');
  });

  it('does not revoke when the role is unchanged', async () => {
    const { useCase, refreshTokenRepository, userRepository } = build(user(UserRole.ADMIN));
    await useCase.execute('user-1', { role: UserRole.ADMIN });
    expect(userRepository.update).toHaveBeenCalled();
    expect(refreshTokenRepository.revokeByUserId).not.toHaveBeenCalled();
  });

  it('throws UserNotFoundException and revokes nothing for an unknown user', async () => {
    const { useCase, refreshTokenRepository, userRepository } = build(null);
    await expect(useCase.execute('nope', { role: UserRole.ADMIN })).rejects.toBeInstanceOf(
      UserNotFoundException,
    );
    expect(userRepository.update).not.toHaveBeenCalled();
    expect(refreshTokenRepository.revokeByUserId).not.toHaveBeenCalled();
  });
});
