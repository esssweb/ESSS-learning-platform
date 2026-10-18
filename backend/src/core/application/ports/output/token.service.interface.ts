export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface TwoFactorChallengePayload {
  authId: string;
  method: string;
}

export interface TokenServiceInterface {
  generateAccessToken(payload: TokenPayload): string;
  generateRefreshToken(payload: TokenPayload): string;
  verifyRefreshToken(token: string): TokenPayload;
  generateVerificationToken(payload: { email: string }): string;
  verifyVerificationToken(token: string): { email: string };
  generateTwoFactorChallengeToken(payload: TwoFactorChallengePayload): string;
  verifyTwoFactorChallengeToken(token: string): TwoFactorChallengePayload;
}
