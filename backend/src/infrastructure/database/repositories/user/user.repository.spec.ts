import { UserRole } from '../../../../core/domain/enums/user-role.enum';
import { User } from '../../../../core/domain/models/user/user.model';
import { UserEntity } from '../../entities/user.entity';
import { UserRepository } from './user.repository';

describe('UserRepository', () => {
  let repository: UserRepository;
  const userModel = {
    create: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    findAndCountAll: jest.fn(),
    findAll: jest.fn(),
    count: jest.fn(),
    destroy: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new UserRepository(userModel as unknown as typeof UserEntity);
  });

  it('creates and maps a user', async () => {
    const domainUser = new User({
      authId: 'auth-id',
      firstName: 'Test',
      lastName: 'User',
      role: UserRole.STUDENT,
    });

    userModel.create.mockResolvedValue({
      id: 'user-id',
      authId: 'auth-id',
      firstName: 'Test',
      lastName: 'User',
      phoneNumber: null,
      profilePicture: null,
      gender: null,
      role: UserRole.STUDENT,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await repository.create(domainUser);

    expect(userModel.create).toHaveBeenCalledTimes(1);
    expect(result.authId).toBe('auth-id');
    expect(result.role).toBe(UserRole.STUDENT);
  });

  it('returns paginated users', async () => {
    userModel.findAndCountAll.mockResolvedValue({
      rows: [
        {
          id: 'user-id',
          authId: 'auth-id',
          firstName: 'Test',
          lastName: 'User',
          phoneNumber: null,
          profilePicture: null,
          gender: null,
          role: UserRole.STUDENT,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      count: 1,
    });

    const result = await repository.findWithPagination({ page: 1, limit: 20 });

    expect(userModel.findAndCountAll).toHaveBeenCalledTimes(1);
    expect(result.total).toBe(1);
    expect(result.data).toHaveLength(1);
  });
});
