import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Auth } from '../../../../core/domain/models/auth/auth.model';
import { AuthRepositoryInterface } from '../../../../core/domain/repositories/auth.repository.interface';
import { AuthEntity } from '../../entities/auth.entity';
import { AuthMapper } from '../../mappers/auth.mapper';
import { BaseSequelizeRepository } from '../base/base.repository';

@Injectable()
export class AuthRepository
  extends BaseSequelizeRepository<Auth, AuthEntity>
  implements AuthRepositoryInterface
{
  constructor(
    @InjectModel(AuthEntity) private readonly authModel: typeof AuthEntity,
  ) {
    super(authModel);
  }

  protected toDomain(entity: AuthEntity): Auth {
    return AuthMapper.toDomain(entity);
  }

  async create(entity: Auth): Promise<Auth> {
    const payload = AuthMapper.toEntity(entity);
    const createdEntity = await this.authModel.create(
      payload as Partial<AuthEntity>,
    );
    return this.toDomain(createdEntity);
  }

  async update(id: string, entity: Partial<Auth>): Promise<Auth> {
    const existing = await this.authModel.findByPk(id);
    if (!existing) {
      throw new Error(`Auth record not found: ${id}`);
    }

    const payload =
      entity instanceof Auth
        ? AuthMapper.toEntity(entity)
        : (entity as unknown as Partial<AuthEntity>);

    await existing.update(payload);
    return this.toDomain(existing);
  }

  async findByEmail(email: string): Promise<Auth | null> {
    const entity = await this.authModel.findOne({
      where: { email: email.toLowerCase().trim() },
    });

    return entity ? this.toDomain(entity) : null;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.authModel.count({
      where: { email: email.toLowerCase().trim() },
    });

    return count > 0;
  }
}
