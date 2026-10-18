import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailServiceInterface } from '../../../core/application/ports/output/email.service.interface';

/**
 * Email service implementation that delegates to a Google Apps Script Web App.
 *
 * Registration (sendOtp) POSTs:
 *   { email: string, verificationUrl: string }
 * The OTP is embedded in the verification URL so the user just clicks a link.
 *
 * Admin sign-in (sendLoginOtp) POSTs:
 *   { email: string, type: 'admin-login-code', code: string, expiresInMinutes: number }
 * The Apps Script must branch on `type === 'admin-login-code'` and render the
 * code as text (no link). The registration body is unchanged.
 */
@Injectable()
export class GoogleScriptEmailService implements EmailServiceInterface {
  private readonly logger = new Logger(GoogleScriptEmailService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendOtp(email: string, otpCode: string): Promise<void> {
    const scriptUrl = this.configService.get<string>('GOOGLE_SCRIPT_URL');
    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3001',
    );

    if (!scriptUrl) {
      throw new Error(
        'GOOGLE_SCRIPT_URL is not configured but GoogleScriptEmailService is in use.',
      );
    }

    // Build the magic-link URL so the user can just click to verify
    const verificationUrl = `${frontendUrl}/verify-email?email=${encodeURIComponent(email)}&code=${encodeURIComponent(otpCode)}`;

    this.logger.log(`Sending OTP email via Google Apps Script to ${email}`);
    if (this.configService.get<string>('NODE_ENV') !== 'production') {
      this.logger.log(`[DEV] OTP for ${email}: ${otpCode}`);
    }

    await this.post(scriptUrl, { email, verificationUrl });

    this.logger.log(`OTP email delivered successfully to ${email}`);
  }

  async sendLoginOtp(email: string, otpCode: string, expiresAt: Date): Promise<void> {
    const scriptUrl = this.configService.get<string>('GOOGLE_SCRIPT_URL');
    if (!scriptUrl) {
      throw new Error(
        'GOOGLE_SCRIPT_URL is not configured but GoogleScriptEmailService is in use.',
      );
    }

    const expiresInMinutes = Math.max(1, Math.round((expiresAt.getTime() - Date.now()) / 60000));

    this.logger.log(`Sending admin login code via Google Apps Script to ${email}`);
    if (this.configService.get<string>('NODE_ENV') !== 'production') {
      this.logger.log(`[DEV] Login OTP for ${email}: ${otpCode}`);
    }

    await this.post(scriptUrl, {
      email,
      type: 'admin-login-code',
      code: otpCode,
      expiresInMinutes,
    });

    this.logger.log(`Login code email delivered successfully to ${email}`);
  }

  private async post(scriptUrl: string, payload: Record<string, unknown>): Promise<void> {
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      // Google Apps Script redirects after a successful POST — follow them
      redirect: 'follow',
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      this.logger.error(
        `Google Apps Script responded with ${response.status}: ${text}`,
      );
      throw new Error(
        `Failed to send email via Google Apps Script (HTTP ${response.status})`,
      );
    }

    let result: { success: boolean; error?: string };
    try {
      result = (await response.json()) as { success: boolean; error?: string };
    } catch {
      // The script might return plain text on redirect responses — treat as success
      this.logger.warn(
        'Could not parse Google Apps Script JSON response; assuming success.',
      );
      return;
    }

    if (!result.success) {
      this.logger.error(
        `Google Apps Script reported failure: ${result.error ?? 'unknown'}`,
      );
      throw new Error(
        `Google Apps Script email error: ${result.error ?? 'unknown'}`,
      );
    }
  }
}
