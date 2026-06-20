export interface AuthProps {
  id?: string;
  email: string;
  password?: string;
  emailVerified: boolean;
  otpCode?: string;
  otpExpiresAt?: Date;
  otpAttemptCount: number;
  otpRequestCount: number;
  lastOtpSentAt?: Date;
  verificationToken?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Auth {
  private props: AuthProps;

  constructor(props: AuthProps) {
    this.props = props;
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get password(): string | undefined {
    return this.props.password;
  }

  get emailVerified(): boolean {
    return this.props.emailVerified;
  }

  get otpCode(): string | undefined {
    return this.props.otpCode;
  }

  get otpExpiresAt(): Date | undefined {
    return this.props.otpExpiresAt;
  }

  get otpAttemptCount(): number {
    return this.props.otpAttemptCount;
  }

  get otpRequestCount(): number {
    return this.props.otpRequestCount;
  }

  get lastOtpSentAt(): Date | undefined {
    return this.props.lastOtpSentAt;
  }

  get verificationToken(): string | undefined {
    return this.props.verificationToken;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  isFullyRegistered(): boolean {
    return this.props.password != null;
  }

  isOtpExpired(): boolean {
    if (!this.props.otpExpiresAt) return true;
    return new Date() > this.props.otpExpiresAt;
  }

  canAttemptOtp(): boolean {
    return (
      this.props.otpAttemptCount < 5 &&
      !this.isOtpExpired() &&
      this.props.otpCode != null
    );
  }

  canRequestNewOtp(): boolean {
    if (this.props.otpRequestCount < 3) return true;
    if (!this.props.lastOtpSentAt) return true;
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (this.props.lastOtpSentAt < oneHourAgo) return true;
    return false;
  }

  incrementOtpAttempts(): void {
    this.props.otpAttemptCount += 1;
  }

  setOtp(hashedOtp: string, expiresAt: Date): void {
    this.props.otpCode = hashedOtp;
    this.props.otpExpiresAt = expiresAt;
    this.props.otpAttemptCount = 0;

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (!this.props.lastOtpSentAt || this.props.lastOtpSentAt < oneHourAgo) {
      this.props.otpRequestCount = 1;
    } else {
      this.props.otpRequestCount += 1;
    }
    this.props.lastOtpSentAt = new Date();
  }

  markEmailVerified(token: string): void {
    this.props.emailVerified = true;
    this.props.verificationToken = token;
    this.props.otpCode = undefined;
    this.props.otpExpiresAt = undefined;
    this.props.otpAttemptCount = 0;
  }

  setPassword(hashedPassword: string): void {
    this.props.password = hashedPassword;
    this.props.verificationToken = undefined;
  }

  activate(): void {
    this.props.isActive = true;
  }

  deactivate(): void {
    this.props.isActive = false;
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      emailVerified: this.emailVerified,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
