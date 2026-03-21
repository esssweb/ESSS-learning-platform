import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { LoginRequestDto } from '@core/application/dto/auth';
import { RegisterRequestDto } from '../dto/auth/register-request.dto';
import { RefreshTokenRequestDto } from '../dto/auth/refresh-token-request.dto';

import { Public } from '@infrastructure/security/decorators/public.decorator';
import { JwtAuthGuard } from '@infrastructure/security/guards/jwt-auth.guard';
import { CurrentUser } from '@infrastructure/security/decorators/current-user.deorator';

import {
  LoginUseCase,
  LogoutUseCase,
  RefreshTokenUseCase,
  RegisterUseCase,
} from '@core/application/use-cases/auth';




@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  // ---------------- REGISTER ----------------

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() dto: RegisterRequestDto) {
    return this.registerUseCase.execute({
      email: dto.email,
      password: dto.password,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: dto.role,
    });
  }

  // ---------------- LOGIN ----------------

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'User login' })
  async login(@Body() dto: LoginRequestDto) {
    return this.loginUseCase.execute({
      email: dto.email,
      password: dto.password,
    });
  }

  // ---------------- REFRESH TOKEN ----------------

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() dto: RefreshTokenRequestDto) {
    return this.refreshTokenUseCase.execute({
      refreshToken: dto.refreshToken,
    });
  }

  // ---------------- LOGOUT ----------------

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('logout')
  @ApiOperation({ summary: 'Logout current session' })
  async logout(@CurrentUser() user: {id: string}, @Body('refreshToken') refreshToken?: string)
  {
    await this.logoutUseCase.execute(user.id, refreshToken);
  }

  // ---------------- REVOKE ALL TOKENS ----------------

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('revoke-all-sessions')
  @ApiOperation({ summary: 'Logout current session' })
  async revokeAll(@CurrentUser() user: any) {
    await this.logoutUseCase.execute(user.id);
  }
}
