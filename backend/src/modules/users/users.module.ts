import { Module } from '@nestjs/common';
import { HASH_SERVICE } from '../../core/application/ports/tokens';
import { AssignRoleUseCase } from '../../core/application/use-cases/users/assign-role.use-case';
import { CreateUserUseCase } from '../../core/application/use-cases/users/create-user.use-case';
import { DeleteUserUseCase } from '../../core/application/use-cases/users/delete-user.use-case';
import { GetUserUseCase } from '../../core/application/use-cases/users/get-user.use-case';
import { ListUsersUseCase } from '../../core/application/use-cases/users/list-users.use-case';
import { UpdateUserUseCase } from '../../core/application/use-cases/users/update-user.use-case';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { BcryptHashService } from '../../infrastructure/security/services/bcrypt-hash.service';
import { UsersController } from '../../presentation/http/controllers/users/users.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [
    CreateUserUseCase,
    GetUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    ListUsersUseCase,
    AssignRoleUseCase,
    {
      provide: HASH_SERVICE,
      useClass: BcryptHashService,
    },
  ],
  exports: [
    CreateUserUseCase,
    GetUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    ListUsersUseCase,
    AssignRoleUseCase,
  ],
})
export class UsersModule {}
