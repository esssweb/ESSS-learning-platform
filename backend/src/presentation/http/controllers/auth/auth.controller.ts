import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SendVerificationOtpUseCase } from '../../../../core/application/use-cases/auth/send-verification-otp.use-case';
import { VerifyOtpUseCase } from '../../../../core/application/use-cases/auth/verify-otp.use-case';
import { RegisterUseCase } from '../../../../core/application/use-cases/auth/register.use-case';
import { DomainException } from '../../../../core/domain/exceptions/domain.exception';
import { SendOtpDto } from '../../dto/auth/send-otp.dto';
import { VerifyOtpDto } from '../../dto/auth/verify-otp.dto';
import { RegisterDto } from '../../dto/auth/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly sendVerificationOtpUseCase: SendVerificationOtpUseCase,
    private readonly verifyOtpUseCase: VerifyOtpUseCase,
    private readonly registerUseCase: RegisterUseCase,
  ) {}

  @Post('send-verification-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send verification OTP to email' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  async sendOtp(@Body() body: SendOtpDto) {
    try {
      return await this.sendVerificationOtpUseCase.execute({
        email: body.email,
      });
    } catch (error) {
      this.handleDomainError(error);
    }
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP and get verification token' })
  @ApiResponse({ status: 200, description: 'OTP verified, verification token returned' })
  async verifyOtp(@Body() body: VerifyOtpDto) {
    try {
      return await this.verifyOtpUseCase.execute({
        email: body.email,
        otpCode: body.otpCode,
      });
    } catch (error) {
      this.handleDomainError(error);
    }
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user with verified email' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  async register(@Body() body: RegisterDto) {
    try {
      return await this.registerUseCase.execute({
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
    } catch (error) {
      this.handleDomainError(error);
    }
  }

  private handleDomainError(error: unknown): never {
    if (error instanceof DomainException) {
      const message = error.message.toLowerCase();
      if (message.includes('already exists')) {
        throw new HttpException(error.message, HttpStatus.CONFLICT);
      }
      if (message.includes('rate') || message.includes('too many')) {
        throw new HttpException(error.message, HttpStatus.TOO_MANY_REQUESTS);
      }
      if (message.includes('expired') || message.includes('invalid') || message.includes('not verified')) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      if (message.includes('maximum') || message.includes('attempts')) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }

    throw error;
  }
}
