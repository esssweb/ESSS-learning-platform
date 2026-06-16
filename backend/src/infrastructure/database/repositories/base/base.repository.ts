import { Model, ModelStatic } from 'sequelize';
import { BaseRepositoryInterface } from '../../../../core/domain/repositories/base-repository.interface';

export abstract class BaseSequelizeRepository<TDomain, TEntity extends Model>
  implements BaseRepositoryInterface<TDomain>
{
  constructor(protected readonly model: ModelStatic<TEntity>) {}

  protected abstract toDomain(entity: TEntity): TDomain;

  abstract create(entity: TDomain): Promise<TDomain>;

  abstract update(id: string, entity: Partial<TDomain>): Promise<TDomain>;

  async findById(id: string): Promise<TDomain | null> {
    const entity = await this.model.findByPk(id);
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(): Promise<TDomain[]> {
    const entities = await this.model.findAll();
    return entities.map((entity) => this.toDomain(entity));
  }

  async delete(id: string): Promise<void> {
    await this.model.destroy({ where: { id } as unknown as never });
  }
}
