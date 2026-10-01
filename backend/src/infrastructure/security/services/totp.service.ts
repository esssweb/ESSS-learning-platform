import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { TotpServiceInterface } from '../../../core/application/ports/output/totp.service.interface';

/**
 * TOTP with a +/-1 step tolerance for clock skew. `verify` returns the time-step
 * a code belongs to so the caller can record it and reject a replay of the same
 * code inside its own 30-second window.
 *
 * Every operation uses a private clone of otplib's authenticator so this service
 * never mutates the process-global instance.
 */
@Injectable()
export class OtplibTotpService implements TotpServiceInterface {
  private static readonly STEP_SECONDS = 30;
  private static readonly ISSUER = 'ESSS Learning';

  // Options must be assigned AFTER clone(): options passed to clone() are
  // overridden by the global instance's options.
  private instance(epoch?: number) {
    const totp = authenticator.clone();
    totp.options = {
      step: OtplibTotpService.STEP_SECONDS,
      window: 1,
      ...(epoch === undefined ? {} : { epoch }),
    };
    return totp;
  }

  generateSecret(): string {
    return this.instance().generateSecret();
  }

  buildOtpauthUri(secret: string, email: string): string {
    return this.instance().keyuri(email, OtplibTotpService.ISSUER, secret);
  }

  verify(secret: string, code: string): number | null {
    // One clock read: the window check and the reported step must agree even if
    // a 30s boundary passes mid-call, otherwise the wrong step gets recorded.
    const now = Date.now();
    const delta = this.instance(now).checkDelta(code, secret);
    if (delta === null) {
      return null;
    }
    return Math.floor(now / 1000 / OtplibTotpService.STEP_SECONDS) + delta;
  }
}
