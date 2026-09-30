import { UserRole } from '../../../domain/enums/user-role.enum';
import { Auth } from '../../../domain/models/auth/auth.model';
import { User } from '../../../domain/models/user/user.model';
import { RegisterRequestDto } from '../../dto/auth/register-request.dto';
import { RegisterUseCase } from './register.use-case';

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;
  const authRepository = { findByEmail: jest.fn(), update: jest.fn() };
  const userRepository = { create: jest.fn() };
  const refreshTokenRepository = { create: jest.fn() };
  const deviceTokenRepository = { create: jest.fn() };
  const hashService = { hash: jest.fn() };
  const tokenService = {
    verifyVerificationToken: jest.fn(),
    generateAccessToken: jest.fn(),
    generateRefreshToken: jest.fn(),
  };

  const dto: RegisterRequestDto = {
    verificationToken: 'verification-token',
    email: 'new@example.com',
    password: 'Passw0rd!',
    firstName: 'New',
    lastName: 'User',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new RegisterUseCase(
      authRepository as never,
      userRepository as never,
      refreshTokenRepository as never,
      deviceTokenRepository as never,
      hashService as never,
      tokenService as never,
    );

    tokenService.verifyVerificationToken.mockReturnValue({ email: dto.email });
    authRepository.findByEmail.mockResolvedValue(
      new Auth({
        id: 'auth-id',
        email: dto.email,
        emailVerified: true,
        verificationToken: dto.verificationToken,
        otpAttemptCount: 0,
        otpRequestCount: 0,
        isActive: true,
      }),
    );
    hashService.hash.mockResolvedValue('hashed-password');
    userRepository.create.mockImplementation(
      async (user: User) =>
        new User({
          id: 'user-id',
          authId: user.authId,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        }),
    );
    tokenService.generateAccessToken.mockReturnValue('access-token');
    tokenService.generateRefreshToken.mockReturnValue('refresh-token');
  });

  it('registers the user as STUDENT', async () => {
    const result = await useCase.execute(dto);

    expect(userRepository.create.mock.calls[0][0].role).toBe(UserRole.STUDENT);
    expect(result.user.role).toBe(UserRole.STUDENT);
  });

  it('ignores a role smuggled into the request and issues a STUDENT token', async () => {
    const result = await useCase.execute({
      ...dto,
      role: UserRole.SUPER_ADMIN,
    } as RegisterRequestDto);

    expect(userRepository.create.mock.calls[0][0].role).toBe(UserRole.STUDENT);
    expect(tokenService.generateAccessToken).toHaveBeenCalledWith(
      expect.objectContaining({ role: UserRole.STUDENT }),
    );
    expect(result.user.role).toBe(UserRole.STUDENT);
  });
});
