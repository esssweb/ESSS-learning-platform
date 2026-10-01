import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  IsUUID,
} from 'sequelize-typescript';

@Table({
  tableName: 'auth',
  timestamps: true,
  underscored: true,
})
export class AuthEntity extends Model {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    unique: true,
  })
  email: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  password: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'email_verified',
  })
  emailVerified: boolean;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: 'otp_code',
  })
  otpCode: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'otp_expires_at',
  })
  otpExpiresAt: Date;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'otp_attempt_count',
  })
  otpAttemptCount: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'otp_request_count',
  })
  otpRequestCount: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'last_otp_sent_at',
  })
  lastOtpSentAt: Date;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: 'verification_token',
  })
  verificationToken: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active',
  })
  isActive: boolean;

  @Column({ type: DataType.TEXT, allowNull: true, field: 'totp_secret' })
  totpSecret: string;

  @Column({ type: DataType.DATE, allowNull: true, field: 'totp_enabled_at' })
  totpEnabledAt: Date;

  @Column({ type: DataType.BIGINT, allowNull: true, field: 'totp_last_used_step' })
  totpLastUsedStep: number;

  @Column({ type: DataType.TEXT, allowNull: true, field: 'login_otp_code' })
  loginOtpCode: string;

  @Column({ type: DataType.DATE, allowNull: true, field: 'login_otp_expires_at' })
  loginOtpExpiresAt: Date;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'login_otp_attempt_count',
  })
  loginOtpAttemptCount: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'login_otp_request_count',
  })
  loginOtpRequestCount: number;

  @Column({ type: DataType.DATE, allowNull: true, field: 'login_otp_last_sent_at' })
  loginOtpLastSentAt: Date;
}
