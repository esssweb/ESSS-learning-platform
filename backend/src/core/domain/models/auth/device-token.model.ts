export interface DeviceTokenProps {
  id?: string;
  userId: string;
  firebaseToken: string;
  deviceName?: string;
  deviceType?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class DeviceToken {
  private props: DeviceTokenProps;

  constructor(props: DeviceTokenProps) {
    this.props = props;
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get firebaseToken(): string {
    return this.props.firebaseToken;
  }

  get deviceName(): string | undefined {
    return this.props.deviceName;
  }

  get deviceType(): string | undefined {
    return this.props.deviceType;
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

  updateToken(newToken: string): void {
    this.props.firebaseToken = newToken;
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
      userId: this.userId,
      firebaseToken: this.firebaseToken,
      deviceName: this.deviceName,
      deviceType: this.deviceType,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
