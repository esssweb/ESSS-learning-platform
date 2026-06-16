import { RefreshToken } from '../../../../core/domain/models/auth/refresh-token.model';
import { RefreshTokenEntity } from '../../entities/refresh-token.entity';
import { RefreshTokenRepository } from './refresh-token.repository';

describe('RefreshTokenRepository', () => {
  let repository: RefreshTokenRepository;
  const refreshTokenModel = {
    create: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    findAndCountAll: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new RefreshTokenRepository(
      refreshTokenModel as unknown as typeof RefreshTokenEntity,
    );
  });

  it('creates and maps a refresh token', async () => {
    const token = new RefreshToken({
      userId: 'user-id',
      token: 'token-value',
      expiresAt: new Date(Date.now() + 60_000),
      isRevoked: false,
    });

    refreshTokenModel.create.mockResolvedValue({
      id: 'token-id',
      userId: 'user-id',
      token: 'token-value',
      deviceTokenId: null,
      expiresAt: token.expiresAt,
      isRevoked: false,
      createdAt: new Date(),
    });

    const result = await repository.create(token);

    expect(refreshTokenModel.create).toHaveBeenCalledTimes(1);
    expect(result.token).toBe('token-value');
    expect(result.userId).toBe('user-id');
  });

  it('revokes tokens by user id', async () => {
    refreshTokenModel.update.mockResolvedValue([2]);

    await repository.revokeByUserId('user-id');

    expect(refreshTokenModel.update).toHaveBeenCalledWith(
      { isRevoked: true },
      expect.objectContaining({
        where: expect.objectContaining({ userId: 'user-id', isRevoked: false }),
      }),
    );
  });
});
