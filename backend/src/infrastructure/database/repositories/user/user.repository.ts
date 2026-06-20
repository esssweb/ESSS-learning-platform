import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FindOptions } from 'sequelize';
import { UserRole } from '../../../../core/domain/enums/user-role.enum';
import { User } from '../../../../core/domain/models/user/user.model';
import {
  UserPaginationOptions,
  UserPaginationResult,
  UserRepositoryInterface,
} from '../../../../core/domain/repositories/user.repository.interface';
import { UserNotFoundException } from '../../../../core/domain/exceptions/user-not-found.exception';
import { UserEntity } from '../../entities/user.entity';
import { UserMapper } from '../../mappers/user.mapper';
import { BaseSequelizeRepository } from '../base/base.repository';

@Injectable()
export class UserRepository
  extends BaseSequelizeRepository<User, UserEntity>
  implements UserRepositoryInterface
{
  constructor(@InjectModel(UserEntity) private readonly userModel: typeof UserEntity) {
    super(userModel);
  }

  protected toDomain(entity: UserEntity): User {
    return UserMapper.toDomain(entity);
  }

  async create(entity: User): Promise<User> {
    const payload = UserMapper.toEntity(entity);
    const createdEntity = await this.userModel.create(payload as Partial<UserEntity>);
    return this.toDomain(createdEntity);
  }

  async update(id: string, entity: Partial<User>): Promise<User> {
    const existing = await this.userModel.findByPk(id);
    if (!existing) {
      throw new UserNotFoundException(id);
    }

    const payload =
      entity instanceof User
        ? UserMapper.toEntity(entity)
        : (entity as unknown as Partial<UserEntity>);

    await existing.update(payload);
    return this.toDomain(existing);
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.userModel.findOne({
      where: { email },
    });

    return entity ? this.toDomain(entity) : null;
  }

  async findByAuthId(authId: string): Promise<User | null> {
    const entity = await this.userModel.findOne({
      where: { authId },
    });

    return entity ? this.toDomain(entity) : null;
  }

  async findByPhone(phoneNumber: string): Promise<User | null> {
    const normalizedPhoneNumber = phoneNumber.replace(/\D/g, '');
    const entity = await this.userModel.findOne({
      where: { phoneNumber: normalizedPhoneNumber },
    });

    return entity ? this.toDomain(entity) : null;
  }

  async findByRole(role: UserRole): Promise<User[]> {
    const entities = await this.userModel.findAll({
      where: { role },
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  async findActiveUsers(): Promise<User[]> {
    const entities = await this.userModel.findAll({
      where: { isActive: true },
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.userModel.count({
      where: { email },
    });

    return count > 0;
  }

  async existsByPhone(phoneNumber: string): Promise<boolean> {
    const normalizedPhoneNumber = phoneNumber.replace(/\D/g, '');
    const count = await this.userModel.count({
      where: { phoneNumber: normalizedPhoneNumber },
    });

    return count > 0;
  }

  async findWithPagination(options: UserPaginationOptions): Promise<UserPaginationResult> {
    const page = Math.max(1, options.page);
    const limit = Math.max(1, Math.min(options.limit, 100));
    const offset = (page - 1) * limit;

    const findOptions: FindOptions<UserEntity> = {
      offset,
      limit,
      order: [['createdAt', 'DESC']],
      where: options.role ? { role: options.role } : undefined,
    };

    const { rows, count } = await this.userModel.findAndCountAll(findOptions);

    return {
      data: rows.map((entity) => this.toDomain(entity)),
      total: count,
      page,
      limit,
    };
  }
}
