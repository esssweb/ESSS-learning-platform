import { UserRole } from '../../../domain/enums/user-role.enum';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception';
import { User } from '../../../domain/models/user/user.model';
import { DeleteUserUseCase } from './delete-user.use-case';

describe('DeleteUserUseCase', () => {
  let useCase: DeleteUserUseCase;
  const userRepository = { findById: jest.fn(), delete: jest.fn() };
  const authRepository = { delete: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new DeleteUserUseCase(userRepository as never, authRepository as never);
  });

  it('deletes the parent auth row so the whole account is removed', async () => {
    userRepository.findById.mockResolvedValue(
      new User({
        id: 'user-id',
        authId: 'auth-id',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.STUDENT,
      }),
    );

    await useCase.execute('user-id');

    expect(authRepository.delete).toHaveBeenCalledWith('auth-id');
    expect(userRepository.delete).not.toHaveBeenCalled();
  });

  it('throws and deletes nothing when the user does not exist', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('missing-id')).rejects.toBeInstanceOf(UserNotFoundException);
    expect(authRepository.delete).not.toHaveBeenCalled();
  });
});
