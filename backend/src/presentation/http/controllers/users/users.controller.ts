import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '../../../../core/domain/enums/user-role.enum';
import { Roles } from '../../../../infrastructure/security/decorators/roles.decorator';
import { AssignRoleUseCase } from '../../../../core/application/use-cases/users/assign-role.use-case';
import { CreateUserUseCase } from '../../../../core/application/use-cases/users/create-user.use-case';
import { DeleteUserUseCase } from '../../../../core/application/use-cases/users/delete-user.use-case';
import { GetUserUseCase } from '../../../../core/application/use-cases/users/get-user.use-case';
import { ListUsersUseCase } from '../../../../core/application/use-cases/users/list-users.use-case';
import { UpdateUserUseCase } from '../../../../core/application/use-cases/users/update-user.use-case';
import { CreateUserDto } from '../../dto/users/create-user.dto';
import { UpdateUserDto } from '../../dto/users/update-user.dto';
import { AssignRoleDto } from '../../dto/users/assign-role.dto';
import { ListUsersResponseHttpDto, UserResponseHttpDto } from '../../dto/users/user-response.dto';
import { ListUsersQueryDto } from '../../dto/users/list-users-query.dto';

@ApiTags('users')
@ApiBearerAuth()
// Every route here is an administrative capability: enumerating users, creating
// them with an arbitrary role, deleting them, and reassigning roles. Applied at
// class level so a newly added route is restricted by default rather than open.
// Self-service profile access belongs on a separate /users/me surface.
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@ApiResponse({ status: 401, description: 'Missing or invalid access token' })
@ApiResponse({ status: 403, description: 'Requires ADMIN or SUPER_ADMIN role' })
@Controller('users')
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly assignRoleUseCase: AssignRoleUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({ status: 201, type: UserResponseHttpDto })
  async create(@Body() body: CreateUserDto): Promise<UserResponseHttpDto> {
    return this.createUserUseCase.execute(body);
  }

  @Get()
  @ApiOperation({ summary: 'List users' })
  @ApiResponse({ status: 200, type: ListUsersResponseHttpDto })
  async list(@Query() query: ListUsersQueryDto): Promise<ListUsersResponseHttpDto> {
    return this.listUsersUseCase.execute(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID (UUID)' })
  @ApiResponse({ status: 200, type: UserResponseHttpDto })
  async getById(@Param('id') id: string): Promise<UserResponseHttpDto> {
    return this.getUserUseCase.execute(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiParam({ name: 'id', description: 'User ID (UUID)' })
  @ApiResponse({ status: 200, type: UserResponseHttpDto })
  async update(@Param('id') id: string, @Body() body: UpdateUserDto): Promise<UserResponseHttpDto> {
    return this.updateUserUseCase.execute(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user (hard delete)' })
  @ApiParam({ name: 'id', description: 'User ID (UUID)' })
  @ApiResponse({ status: 204 })
  async delete(@Param('id') id: string): Promise<void> {
    await this.deleteUserUseCase.execute(id);
  }

  @Patch(':id/role')
  @ApiOperation({ summary: 'Assign user role' })
  @ApiParam({ name: 'id', description: 'User ID (UUID)' })
  @ApiResponse({ status: 200, type: UserResponseHttpDto })
  async assignRole(
    @Param('id') id: string,
    @Body() body: AssignRoleDto,
  ): Promise<UserResponseHttpDto> {
    return this.assignRoleUseCase.execute(id, body);
  }
}
