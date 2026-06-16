import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AssignRoleUseCase } from '../../../../core/application/use-cases/users/assign-role.use-case';
import { CreateUserUseCase } from '../../../../core/application/use-cases/users/create-user.use-case';
import { DeleteUserUseCase } from '../../../../core/application/use-cases/users/delete-user.use-case';
import { GetUserUseCase } from '../../../../core/application/use-cases/users/get-user.use-case';
import { ListUsersUseCase } from '../../../../core/application/use-cases/users/list-users.use-case';
import { UpdateUserUseCase } from '../../../../core/application/use-cases/users/update-user.use-case';
import { DomainException } from '../../../../core/domain/exceptions/domain.exception';
import { CreateUserDto } from '../../dto/users/create-user.dto';
import { UpdateUserDto } from '../../dto/users/update-user.dto';
import { AssignRoleDto } from '../../dto/users/assign-role.dto';
import { ListUsersResponseHttpDto, UserResponseHttpDto } from '../../dto/users/user-response.dto';
import { ListUsersQueryDto } from '../../dto/users/list-users-query.dto';

@ApiTags('users')
@ApiBearerAuth()
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
    try {
      return await this.createUserUseCase.execute(body);
    } catch (error) {
      this.handleDomainError(error);
    }
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
    try {
      return await this.getUserUseCase.execute(id);
    } catch (error) {
      this.handleDomainError(error);
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiParam({ name: 'id', description: 'User ID (UUID)' })
  @ApiResponse({ status: 200, type: UserResponseHttpDto })
  async update(@Param('id') id: string, @Body() body: UpdateUserDto): Promise<UserResponseHttpDto> {
    try {
      return await this.updateUserUseCase.execute(id, body);
    } catch (error) {
      this.handleDomainError(error);
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user (hard delete)' })
  @ApiParam({ name: 'id', description: 'User ID (UUID)' })
  @ApiResponse({ status: 204 })
  async delete(@Param('id') id: string): Promise<void> {
    try {
      await this.deleteUserUseCase.execute(id);
    } catch (error) {
      this.handleDomainError(error);
    }
  }

  @Patch(':id/role')
  @ApiOperation({ summary: 'Assign user role' })
  @ApiParam({ name: 'id', description: 'User ID (UUID)' })
  @ApiResponse({ status: 200, type: UserResponseHttpDto })
  async assignRole(
    @Param('id') id: string,
    @Body() body: AssignRoleDto,
  ): Promise<UserResponseHttpDto> {
    try {
      return await this.assignRoleUseCase.execute(id, body);
    } catch (error) {
      this.handleDomainError(error);
    }
  }

  private handleDomainError(error: unknown): never {
    if (error instanceof DomainException) {
      const message = error.message.toLowerCase();
      if (message.includes('not found')) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      if (message.includes('already exists') || message.includes('already in use')) {
        throw new HttpException(error.message, HttpStatus.CONFLICT);
      }
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }

    throw error;
  }
}
