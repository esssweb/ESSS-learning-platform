export interface EmailServiceInterface {
  /** Registration email verification. */
  sendOtp(email: string, otpCode: string): Promise<void>;

  /** Admin two-factor sign-in code. Plain code, never a link. */
  sendLoginOtp(email: string, otpCode: string, expiresAt: Date): Promise<void>;
}
