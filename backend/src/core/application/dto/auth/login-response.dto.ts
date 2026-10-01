export class LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export class TwoFactorChallengeDto {
  twoFactorRequired: true;
  method: string;
  challengeToken: string;
  expiresAt: Date;
}

export type LoginResult = LoginResponseDto | TwoFactorChallengeDto;
