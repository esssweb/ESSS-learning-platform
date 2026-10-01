import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EmailServiceInterface } from '../../../core/application/ports/output/email.service.interface';

@Injectable()
export class NodemailerEmailService implements EmailServiceInterface {
  private readonly logger = new Logger(NodemailerEmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port: parseInt(this.configService.get<string>('SMTP_PORT') || '587', 10),
        secure: this.configService.get<string>('SMTP_SECURE') === 'true',
        auth: {
          user: this.configService.get<string>('SMTP_USER'),
          pass: this.configService.get<string>('SMTP_PASSWORD'),
        },
      });
    } else {
      this.logger.warn(
        'SMTP not configured. OTP codes will be logged to console.',
      );
    }
  }

  async sendOtp(email: string, otpCode: string): Promise<void> {
    if (!this.transporter) {
      if (this.configService.get<string>('NODE_ENV') === 'production') {
        throw new Error('SMTP is not configured in production');
      }
      this.logger.log(`[DEV] OTP for ${email}: ${otpCode}`);
      return;
    }

    await this.transporter.sendMail({
      from: this.configService.get<string>('SMTP_FROM') || 'noreply@esss.com',
      to: email,
      subject: 'Your Verification Code - ESSS Learning Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Email Verification</h2>
          <p>Your verification code is:</p>
          <div style="background: #f4f4f4; padding: 16px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 16px 0; border-radius: 8px;">
            ${otpCode}
          </div>
          <p>This code expires in <strong>10 minutes</strong>.</p>
          <p>If you did not request this code, please ignore this email.</p>
        </div>
      `,
    });
  }

  async sendLoginOtp(email: string, otpCode: string, expiresAt: Date): Promise<void> {
    if (!this.transporter) {
      if (this.configService.get<string>('NODE_ENV') === 'production') {
        throw new Error('SMTP is not configured in production');
      }
      this.logger.log(`[DEV] Login OTP for ${email}: ${otpCode}`);
      return;
    }

    const minutes = Math.max(1, Math.round((expiresAt.getTime() - Date.now()) / 60000));

    await this.transporter.sendMail({
      from: this.configService.get<string>('SMTP_FROM') || 'noreply@esss.com',
      to: email,
      subject: 'Your ESSS admin sign-in code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Admin sign-in code</h2>
          <p>Someone signed in to your ESSS admin account with your password. Enter this code to finish signing in:</p>
          <div style="background: #f4f4f4; padding: 16px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 16px 0; border-radius: 8px;">
            ${otpCode}
          </div>
          <p>This code expires in <strong>${minutes} minutes</strong>.</p>
          <p>If this wasn't you, change your password immediately and tell a SUPER_ADMIN.</p>
        </div>
      `,
    });
  }
}
