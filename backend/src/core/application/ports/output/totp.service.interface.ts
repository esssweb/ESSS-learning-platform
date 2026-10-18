export interface TotpServiceInterface {
  generateSecret(): string;
  buildOtpauthUri(secret: string, email: string): string;
  /** Returns the consumed 30-second time-step, or null when the code is invalid. */
  verify(secret: string, code: string): number | null;
}
