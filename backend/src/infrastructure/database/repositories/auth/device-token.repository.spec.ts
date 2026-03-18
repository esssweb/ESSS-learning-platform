import { DeviceToken } from '../../../../core/domain/models/auth/device-token.model';
import { DeviceTokenEntity } from '../../entities/device-token.entity';
import { DeviceTokenRepository } from './device-token.repository';

describe('DeviceTokenRepository', () => {
  let repository: DeviceTokenRepository;
  const deviceTokenModel = {
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
    repository = new DeviceTokenRepository(deviceTokenModel as unknown as typeof DeviceTokenEntity);
  });

  it('creates and maps a device token', async () => {
    const token = new DeviceToken({
      userId: 'user-id',
      firebaseToken: 'firebase-token',
      isActive: true,
    });

    deviceTokenModel.create.mockResolvedValue({
      id: 'device-token-id',
      userId: 'user-id',
      firebaseToken: 'firebase-token',
      deviceName: null,
      deviceType: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await repository.create(token);

    expect(deviceTokenModel.create).toHaveBeenCalledTimes(1);
    expect(result.firebaseToken).toBe('firebase-token');
    expect(result.userId).toBe('user-id');
  });

  it('deactivates all active device tokens by user id', async () => {
    deviceTokenModel.update.mockResolvedValue([1]);

    await repository.deactivateByUserId('user-id');

    expect(deviceTokenModel.update).toHaveBeenCalledWith(
      { isActive: false },
      expect.objectContaining({
        where: expect.objectContaining({ userId: 'user-id', isActive: true }),
      }),
    );
  });
});
