import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { TotpServiceInterface } from '../../../core/application/ports/output/totp.service.interface';

/**
 * TOTP with a +/-1 step tolerance for clock skew. `verify` returns the time-step
 * a code belongs to so the caller can record it and reject a replay of the same
 * code inside its own 30-second window.
 */
@Injectable()
export class OtplibTotpService implements TotpServiceInterface {
  private static readonly STEP_SECONDS = 30;
  private static readonly ISSUER = 'ESSS Learning';

  constructor() {
    authenticator.options = {
      step: OtplibTotpService.STEP_SECONDS,
      window: 1,
    };
  }

  generateSecret(): string {
    return authenticator.generateSecret();
  }

  buildOtpauthUri(secret: string, email: string): string {
    return authenticator.keyuri(email, OtplibTotpService.ISSUER, secret);
  }

  verify(secret: string, code: string): number | null {
    if (!authenticator.check(code, secret)) {
      return null;
    }

    const currentStep = Math.floor(Date.now() / 1000 / OtplibTotpService.STEP_SECONDS);

    // window:1 means the accepted code may belong to the previous, current, or
    // next step. Identify which, so the caller records the right one. otplib
    // has no per-call epoch argument — it is set through options, so save and
    // restore it around the probe.
    //
    // Note: otplib's options setter merges into existing options rather than
    // replacing them, so re-merging a captured `epoch: undefined` back in would
    // leave a stray `epoch` key that overrides the library's own Date.now()
    // default on every future call. `resetOptions()` before reapplying the
    // saved (epoch-free) options avoids that leak.
    const savedOptions = authenticator.options;
    try {
      for (const candidate of [currentStep, currentStep - 1, currentStep + 1]) {
        authenticator.options = {
          ...savedOptions,
          epoch: candidate * OtplibTotpService.STEP_SECONDS * 1000,
        };
        if (authenticator.generate(secret) === code) {
          return candidate;
        }
      }
    } finally {
      authenticator.resetOptions();
      authenticator.options = savedOptions;
    }

    return currentStep;
  }
}
