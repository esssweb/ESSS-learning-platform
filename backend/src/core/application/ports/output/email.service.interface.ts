export interface EmailServiceInterface {
  sendOtp(email: string, otpCode: string): Promise<void>;
}
