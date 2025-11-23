export interface RefreshTokenProps {
  id?: string;
  userId: string;
  token: string;
  deviceTokenId?: string;
  expiresAt: Date;
  isRevoked: boolean;
  createdAt?: Date;
}

export class RefreshToken {
  private props: RefreshTokenProps;

  constructor(props: RefreshTokenProps) {
    this.props = props;
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get token(): string {
    return this.props.token;
  }

  get deviceTokenId(): string | undefined {
    return this.props.deviceTokenId;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get isRevoked(): boolean {
    return this.props.isRevoked;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isValid(): boolean {
    return !this.isRevoked && !this.isExpired();
  }

  revoke(): void {
    this.props.isRevoked = true;
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      token: this.token,
      deviceTokenId: this.deviceTokenId,
      expiresAt: this.expiresAt,
      isRevoked: this.isRevoked,
      createdAt: this.createdAt,
    };
  }
}
