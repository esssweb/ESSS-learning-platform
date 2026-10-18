import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SendVerificationOtpUseCase } from '../../../../core/application/use-cases/auth/send-verification-otp.use-case';
import { VerifyOtpUseCase } from '../../../../core/application/use-cases/auth/verify-otp.use-case';
import { RegisterUseCase } from '../../../../core/application/use-cases/auth/register.use-case';
import { LoginUseCase } from '../../../../core/application/use-cases/auth/login.use-case';
import { RefreshTokenUseCase } from '../../../../core/application/use-cases/auth/refresh-token.use-case';
import { LogoutUseCase } from '../../../../core/application/use-cases/auth/logout.use-case';
import { VerifyTwoFactorUseCase } from '../../../../core/application/use-cases/auth/verify-two-factor.use-case';
import { ResendTwoFactorOtpUseCase } from '../../../../core/application/use-cases/auth/resend-two-factor-otp.use-case';
import { EnrollTotpUseCase } from '../../../../core/application/use-cases/auth/enroll-totp.use-case';
import { ConfirmTotpUseCase } from '../../../../core/application/use-cases/auth/confirm-totp.use-case';
import { DisableTotpUseCase } from '../../../../core/application/use-cases/auth/disable-totp.use-case';
import { USER_REPOSITORY } from '../../../../core/application/ports/tokens';
import { UserRepositoryInterface } from '../../../../core/domain/repositories/user.repository.interface';
import { UserNotFoundException } from '../../../../core/domain/exceptions/user-not-found.exception';
import { UserRole } from '../../../../core/domain/enums/user-role.enum';
import { Roles } from '../../../../infrastructure/security/decorators/roles.decorator';
import { VerifyTwoFactorDto } from '../../dto/auth/verify-two-factor.dto';
import { ResendTwoFactorDto } from '../../dto/auth/resend-two-factor.dto';
import { TotpCodeDto } from '../../dto/auth/totp-code.dto';
import { EnrollTotpDto } from '../../dto/auth/enroll-totp.dto';
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
    private readonly verifyTwoFactorUseCase: VerifyTwoFactorUseCase,
    private readonly resendTwoFactorOtpUseCase: ResendTwoFactorOtpUseCase,
    private readonly enrollTotpUseCase: EnrollTotpUseCase,
    private readonly confirmTotpUseCase: ConfirmTotpUseCase,
    private readonly disableTotpUseCase: DisableTotpUseCase,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
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
      deviceToken: body.deviceToken,
      deviceName: body.deviceName,
      deviceType: body.deviceType,
    });
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with verified account credentials' })
  @ApiResponse({
    status: 200,
    description:
      'Either the issued tokens, or for admins a two-factor challenge ' +
      '{ twoFactorRequired, method, challengeToken, expiresAt } that must be exchanged ' +
      'via POST /auth/2fa/verify',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials or inactive account' })
  @ApiResponse({ status: 429, description: 'Admin two-factor challenge rate limited' })
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

  @Public()
  @Post('2fa/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exchange a two-factor challenge for access tokens' })
  @ApiResponse({ status: 200, description: 'Tokens issued' })
  @ApiResponse({ status: 401, description: 'Invalid code or expired challenge' })
  async verifyTwoFactor(@Body() body: VerifyTwoFactorDto) {
    return this.verifyTwoFactorUseCase.execute(body);
  }

  @Public()
  @Post('2fa/resend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend the email two-factor code' })
  @ApiResponse({
    status: 200,
    description:
      'Code re-sent. Returns { message, expiresAt, challengeToken }; the fresh ' +
      'challengeToken replaces the previous one and must be used for the next verify.',
  })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async resendTwoFactor(@Body() body: ResendTwoFactorDto) {
    return this.resendTwoFactorOtpUseCase.execute(body);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @Post('2fa/totp/enroll')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Begin authenticator app enrollment (requires current password)' })
  @ApiResponse({ status: 401, description: 'Wrong password' })
  @ApiResponse({ status: 403, description: 'Requires ADMIN or SUPER_ADMIN role' })
  @ApiResponse({ status: 409, description: 'Authenticator app already enabled' })
  async enrollTotp(@CurrentUser() user: { userId: string }, @Body() body: EnrollTotpDto) {
    return this.enrollTotpUseCase.execute(await this.resolveAuthId(user.userId), body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @Post('2fa/totp/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm and activate authenticator app enrollment' })
  @ApiResponse({
    status: 401,
    description:
      'Wrong code. This is not a session expiry; clients must not refresh and retry automatically.',
  })
  @ApiResponse({ status: 403, description: 'Requires ADMIN or SUPER_ADMIN role' })
  async confirmTotp(@CurrentUser() user: { userId: string }, @Body() body: TotpCodeDto) {
    return this.confirmTotpUseCase.execute(await this.resolveAuthId(user.userId), body.code);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @Delete('2fa/totp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disable the authenticator app and revert to email codes' })
  @ApiResponse({
    status: 401,
    description:
      'Wrong code. This is not a session expiry; clients must not refresh and retry automatically.',
  })
  @ApiResponse({ status: 403, description: 'Requires ADMIN or SUPER_ADMIN role' })
  async disableTotp(@CurrentUser() user: { userId: string }, @Body() body: TotpCodeDto) {
    return this.disableTotpUseCase.execute(await this.resolveAuthId(user.userId), body.code);
  }

  // The JWT carries a users.id; the TOTP use cases operate on auth.id.
  private async resolveAuthId(userId: string): Promise<string> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }
    return user.authId;
  }
}
