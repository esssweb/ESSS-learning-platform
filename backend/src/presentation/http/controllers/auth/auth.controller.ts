import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SendVerificationOtpUseCase } from '../../../../core/application/use-cases/auth/send-verification-otp.use-case';
import { VerifyOtpUseCase } from '../../../../core/application/use-cases/auth/verify-otp.use-case';
import { RegisterUseCase } from '../../../../core/application/use-cases/auth/register.use-case';
import { LoginUseCase } from '../../../../core/application/use-cases/auth/login.use-case';
import { RefreshTokenUseCase } from '../../../../core/application/use-cases/auth/refresh-token.use-case';
import { LogoutUseCase } from '../../../../core/application/use-cases/auth/logout.use-case';
import { SendOtpDto } from '../../dto/auth/send-otp.dto';
import { VerifyOtpDto } from '../../dto/auth/verify-otp.dto';
import { RegisterDto } from '../../dto/auth/register.dto';
import { LoginRequestDto } from '../../dto/auth/login-request.dto';
import { RefreshTokenRequestDto } from '../../dto/auth/refresh-token-request.dto';
import { Public } from '../../../../infrastructure/security/decorators/public.decorator';
import { JwtAuthGuard } from '../../../../infrastructure/security/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../infrastructure/security/decorators/current-user.deorator';

// Domain exceptions propagate to the global DomainExceptionFilter, which owns
// the domain-error -> HTTP status mapping for the whole application.
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly sendVerificationOtpUseCase: SendVerificationOtpUseCase,
    private readonly verifyOtpUseCase: VerifyOtpUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  @Public()
  @Post('send-verification-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send verification OTP to email' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @ApiResponse({ status: 429, description: 'Too many OTP requests' })
  async sendOtp(@Body() body: SendOtpDto) {
    return this.sendVerificationOtpUseCase.execute({ email: body.email });
  }

  @Public()
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP and get verification token' })
  @ApiResponse({ status: 200, description: 'OTP verified, verification token returned' })
  @ApiResponse({ status: 400, description: 'OTP invalid, expired, or attempts exceeded' })
  async verifyOtp(@Body() body: VerifyOtpDto) {
    return this.verifyOtpUseCase.execute({ email: body.email, otpCode: body.otpCode });
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user with verified email' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 403, description: 'Email has not been verified' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() body: RegisterDto) {
    return this.registerUseCase.execute({
      verificationToken: body.verificationToken,
      email: body.email,
      password: body.password,
      firstName: body.firstName,
      lastName: body.lastName,
      phoneNumber: body.phoneNumber,
      gender: body.gender,
      role: body.role,
      deviceToken: body.deviceToken,
      deviceName: body.deviceName,
      deviceType: body.deviceType,
    });
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with verified account credentials' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials or inactive account' })
  async login(@Body() body: LoginRequestDto) {
    return this.loginUseCase.execute({ email: body.email, password: body.password });
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Access token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Refresh token invalid, expired, or revoked' })
  async refresh(@Body() body: RefreshTokenRequestDto) {
    return this.refreshTokenUseCase.execute({ refreshToken: body.refreshToken });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout current session' })
  async logout(
    @CurrentUser() user: { id: string; userId: string },
    @Body('refreshToken') refreshToken?: string,
  ): Promise<void> {
    await this.logoutUseCase.execute(user.userId ?? user.id, refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('revoke-all-sessions')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout all sessions' })
  async revokeAll(@CurrentUser() user: { id: string; userId: string }): Promise<void> {
    await this.logoutUseCase.execute(user.userId ?? user.id);
  }
}
